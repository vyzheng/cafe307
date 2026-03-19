"""Dish requests API: pay $1 via Stripe to request a dish. Most-requested rise to the top."""
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

VALID_CODES = {"vivian", "vlad", "mushu", "gelato", "caramel", "tangyuan"}


class CreatePaymentIntentBody(BaseModel):
    dishName: str


class ConfirmPaymentBody(BaseModel):
    paymentIntentId: str
    email: Optional[str] = None


def _require_logged_in(
    x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code"),
) -> str:
    code = (x_reservation_code or "").strip().lower()
    if code not in VALID_CODES:
        raise HTTPException(status_code=403, detail="Forbidden")
    return code


@router.get("")
def list_requests(db: Session = Depends(get_db)):
    """Return dishes ranked by request count, descending, with who requested."""
    from sqlalchemy import distinct
    from collections import defaultdict

    # Get counts
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

    # Check granted status per dish (if any request for that dish has granted_at)
    granted_rows = (
        db.query(DishRequest.dish_name, func.max(DishRequest.granted_at).label("granted_at"))
        .group_by(DishRequest.dish_name)
        .all()
    )
    granted_map = {r.dish_name: r.granted_at for r in granted_rows}

    return [
        {
            "dishName": r.dish_name,
            "count": r.count,
            "requestedBy": requesters.get(r.dish_name, []),
            "granted": granted_map.get(r.dish_name) is not None,
        }
        for r in count_results
    ]


@router.post("/create-payment-intent")
def create_payment_intent(
    body: CreatePaymentIntentBody,
    user_code: str = Depends(_require_logged_in),
):
    """Create a Stripe PaymentIntent for a $1 dish request."""
    dish_name = (body.dishName or "").strip().title()
    if not dish_name or len(dish_name) > 200:
        raise HTTPException(status_code=400, detail="Invalid dish name")

    intent = stripe.PaymentIntent.create(
        amount=100,
        currency="usd",
        payment_method_types=["card", "link"],
        metadata={
            "dish_name": dish_name,
            "user_code": user_code,
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

    # Set receipt_email if provided (triggers Stripe email receipt)
    receipt_email = (body.email or "").strip().lower()
    if receipt_email:
        try:
            stripe.PaymentIntent.modify(payment_intent_id, receipt_email=receipt_email)
        except Exception:
            pass  # non-critical — payment still succeeded

    dish_name = intent.metadata.get("dish_name", "").strip().title()
    meta_user = intent.metadata.get("user_code", "").strip().lower()

    if not dish_name or meta_user != user_code:
        raise HTTPException(status_code=400, detail="Payment metadata mismatch")

    # Idempotent: skip if already recorded
    existing = db.query(DishRequest).filter(
        DishRequest.stripe_payment_intent_id == payment_intent_id
    ).first()
    if existing:
        return {"status": "already_recorded"}

    new_request = DishRequest(
        dish_name=dish_name,
        user_code=user_code,
        stripe_payment_intent_id=payment_intent_id,
        created_at=datetime.utcnow(),
    )
    db.add(new_request)
    db.commit()

    return {"status": "ok"}


@router.delete("/admin/clear")
def clear_requests(
    user_code: str = Depends(_require_logged_in),
    db: Session = Depends(get_db),
):
    """Delete all dish requests. Vivian only."""
    if user_code != "vivian":
        raise HTTPException(status_code=403, detail="Forbidden")
    count = db.query(DishRequest).delete()
    db.commit()
    return {"deleted": count}


class GrantBody(BaseModel):
    dishName: str


@router.post("/grant")
def grant_wish(
    body: GrantBody,
    user_code: str = Depends(_require_logged_in),
    db: Session = Depends(get_db),
):
    """Toggle granted status for a dish. Only vivian or vlad can grant."""
    if user_code not in ("vivian", "vlad"):
        raise HTTPException(status_code=403, detail="Forbidden")
    dish_name = body.dishName.strip().title()
    if not dish_name:
        raise HTTPException(status_code=400, detail="Missing dish name")

    # Check if already granted
    first = db.query(DishRequest).filter(
        DishRequest.dish_name == dish_name,
        DishRequest.granted_at.isnot(None),
    ).first()

    if first:
        # Ungrant — clear granted_at on all requests for this dish
        db.query(DishRequest).filter(DishRequest.dish_name == dish_name).update(
            {"granted_at": None}
        )
        db.commit()
        return {"granted": False}
    else:
        # Grant — set granted_at on all requests for this dish
        now = datetime.utcnow()
        db.query(DishRequest).filter(DishRequest.dish_name == dish_name).update(
            {"granted_at": now}
        )
        db.commit()
        return {"granted": True}
