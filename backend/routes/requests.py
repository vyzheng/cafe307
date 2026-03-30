"""
Dish requests API: pay $1 via Stripe to request a dish.

Guests pay $1 to vote for a dish they want on a future menu. Requests are
grouped by dish name and ranked by total vote count. Vivian or Vlad can
"grant" a wish (star toggle), and Vivian can clear all requests.
"""
import os
from datetime import datetime
from typing import Optional

import stripe
from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import DishRequest

router = APIRouter(prefix="/api/requests", tags=["requests"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

# Every guest who can log in to Cafe 307. This set is checked on
# payment and grant endpoints to ensure only known guests participate.
VALID_CODES = {"vivian", "vlad", "mushu", "gelato", "caramel", "tangyuan"}


# ---- Pydantic request bodies ----
# These replace raw dict access for type safety and automatic 422 validation.

class CreatePaymentIntentBody(BaseModel):
    """Body for creating a Stripe PaymentIntent."""
    dishName: str
    isCustom: bool = False       # True = $2 custom request with note
    customNote: Optional[str] = None  # description or URL for custom requests


class ConfirmPaymentBody(BaseModel):
    """Body for confirming payment after Stripe client-side flow completes."""
    paymentIntentId: str
    email: Optional[str] = None  # optional email for branded Cafe 307 receipt


def _require_logged_in(
    x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code"),
) -> str:
    """Verify the caller is any valid guest (not role-specific like auth.py)."""
    code = (x_reservation_code or "").strip().lower()
    if code not in VALID_CODES:
        raise HTTPException(status_code=403, detail="Forbidden")
    return code


@router.get("")
def list_requests(db: Session = Depends(get_db)):
    """Return dishes ranked by request count, descending, with who requested."""
    from sqlalchemy import distinct
    from collections import defaultdict

    # Three queries build the response: counts, requesters, and grant status.
    # Kept separate for clarity rather than one complex join.
    count_results = (
        db.query(
            DishRequest.dish_name,
            func.count(DishRequest.id).label("count"),
        )
        .group_by(DishRequest.dish_name)
        .order_by(func.count(DishRequest.id).desc(), DishRequest.dish_name)
        .all()
    )

    # Get unique requesters per dish
    requester_rows = (
        db.query(DishRequest.dish_name, DishRequest.user_code)
        .distinct()
        .all()
    )
    requesters = defaultdict(list)
    for row in requester_rows:
        requesters[row.dish_name].append(row.user_code)

    # A dish is "granted" if any of its requests has a non-null granted_at.
    # We use max() so a single non-null value marks the whole dish as granted.
    granted_rows = (
        db.query(DishRequest.dish_name, func.max(DishRequest.granted_at).label("granted_at"))
        .group_by(DishRequest.dish_name)
        .all()
    )
    granted_map = {r.dish_name: r.granted_at for r in granted_rows}

    # Gather custom notes per dish (most recent first)
    custom_rows = (
        db.query(DishRequest.dish_name, DishRequest.custom_note, DishRequest.user_code)
        .filter(DishRequest.is_custom == True, DishRequest.custom_note.isnot(None))
        .order_by(DishRequest.created_at.desc())
        .all()
    )
    custom_notes = {}
    for row in custom_rows:
        if row.dish_name not in custom_notes:
            custom_notes[row.dish_name] = []
        custom_notes[row.dish_name].append({
            "note": row.custom_note,
            "by": row.user_code,
        })

    return [
        {
            "dishName": r.dish_name,
            "count": r.count,
            "requestedBy": requesters.get(r.dish_name, []),
            "granted": granted_map.get(r.dish_name) is not None,
            "customNotes": custom_notes.get(r.dish_name, []),
        }
        for r in count_results
    ]


@router.post("/create-payment-intent")
def create_payment_intent(
    body: CreatePaymentIntentBody,
    user_code: str = Depends(_require_logged_in),
):
    """Create a Stripe PaymentIntent: $1 for chef's choice, $2 for custom."""
    dish_name = (body.dishName or "").strip().title()
    if not dish_name or len(dish_name) > 200:
        raise HTTPException(status_code=400, detail="Invalid dish name")

    is_custom = body.isCustom
    custom_note = (body.customNote or "").strip() if is_custom else ""

    if is_custom and not custom_note:
        raise HTTPException(status_code=400, detail="Custom requests need a description or URL")
    if custom_note and len(custom_note) > 1000:
        raise HTTPException(status_code=400, detail="Custom note too long")

    amount = 200 if is_custom else 100  # $2 custom, $1 chef's choice

    intent = stripe.PaymentIntent.create(
        amount=amount,
        currency="usd",
        payment_method_types=["card", "link"],
        metadata={
            "dish_name": dish_name,
            "user_code": user_code,
            "is_custom": "true" if is_custom else "false",
            "custom_note": custom_note,
        },
    )
    return {"clientSecret": intent.client_secret}


@router.post("/confirm")
def confirm_payment(
    body: ConfirmPaymentBody,
    user_code: str = Depends(_require_logged_in),
    db: Session = Depends(get_db),
):
    """Verify a PaymentIntent succeeded with Stripe and record the dish request."""
    from backend.email_receipt import send_receipt

    payment_intent_id = (body.paymentIntentId or "").strip()
    if not payment_intent_id:
        raise HTTPException(status_code=400, detail="Missing paymentIntentId")

    # Verify with Stripe that this payment actually succeeded
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payment intent")

    if intent.status != "succeeded":
        raise HTTPException(status_code=400, detail="Payment not completed")

    dish_name = intent.metadata.get("dish_name", "").strip().title()
    meta_user = intent.metadata.get("user_code", "").strip().lower()
    is_custom = intent.metadata.get("is_custom") == "true"
    custom_note = intent.metadata.get("custom_note", "").strip() or None

    if not dish_name or meta_user != user_code:
        raise HTTPException(status_code=400, detail="Payment metadata mismatch")

    # Idempotent: skip if already recorded
    existing = db.query(DishRequest).filter(
        DishRequest.stripe_payment_intent_id == payment_intent_id
    ).first()
    if existing:
        return {"status": "already_recorded"}

    receipt_email = (body.email or "").strip().lower() or None

    new_request = DishRequest(
        dish_name=dish_name,
        user_code=user_code,
        stripe_payment_intent_id=payment_intent_id,
        is_custom=is_custom,
        custom_note=custom_note,
        receipt_email=receipt_email,
        created_at=datetime.utcnow(),
    )
    db.add(new_request)
    db.commit()

    # Send branded Cafe 307 receipt (best-effort, non-blocking)
    if receipt_email:
        send_receipt(
            to_email=receipt_email,
            dish_name=dish_name,
            amount_cents=intent.amount,
            is_custom=is_custom,
            custom_note=custom_note,
        )

    return {"status": "ok"}


@router.delete("/admin/clear")
def clear_requests(
    user_code: str = Depends(_require_logged_in),
    db: Session = Depends(get_db),
):
    """
    Delete ALL dish requests. Vivian-only admin endpoint.

    Uses a secondary role check (beyond _require_logged_in) because this
    is a destructive operation that only the chef should perform -- e.g.
    after a menu cycle ends and granted wishes are cleared out.
    """
    if user_code != "vivian":
        raise HTTPException(status_code=403, detail="Forbidden")
    count = db.query(DishRequest).delete()
    db.commit()
    return {"deleted": count}


class GrantBody(BaseModel):
    """Body for the grant/ungrant toggle endpoint."""
    dishName: str


@router.post("/grant")
def grant_wish(
    body: GrantBody,
    user_code: str = Depends(_require_logged_in),
    db: Session = Depends(get_db),
):
    """
    Toggle the "granted" star on a dish wish.

    Granting marks ALL requests for that dish_name with granted_at (since
    they represent the same collective wish). Toggling again clears it.
    Only vivian (chef) and vlad (VIP) can grant wishes.
    """
    if user_code not in ("vivian", "vlad"):
        raise HTTPException(status_code=403, detail="Forbidden")
    dish_name = body.dishName.strip().title()
    if not dish_name:
        raise HTTPException(status_code=400, detail="Missing dish name")

    # Toggle logic: if any request for this dish is already granted, ungrant all;
    # otherwise grant all. This treats all requests for the same dish as one wish.
    first = db.query(DishRequest).filter(
        DishRequest.dish_name == dish_name,
        DishRequest.granted_at.isnot(None),
    ).first()

    if first:
        # Ungrant -- clear granted_at on all requests for this dish
        db.query(DishRequest).filter(DishRequest.dish_name == dish_name).update(
            {"granted_at": None}
        )
        db.commit()
        return {"granted": False}
    else:
        # Grant -- set granted_at on all requests for this dish
        now = datetime.utcnow()
        db.query(DishRequest).filter(DishRequest.dish_name == dish_name).update(
            {"granted_at": now}
        )
        db.commit()
        return {"granted": True}
