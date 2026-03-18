"""Dish requests API: pay $1 via Stripe to request a dish. Most-requested rise to the top."""
import os
from datetime import datetime
from typing import Optional

import stripe
from fastapi import APIRouter, Body, Depends, Header, HTTPException, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import DishRequest

router = APIRouter(prefix="/api/requests", tags=["requests"])

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

VALID_CODES = {"vivian", "vlad", "mushu", "gelato", "caramel", "tangyuan"}


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

    return [
        {
            "dishName": r.dish_name,
            "count": r.count,
            "requestedBy": requesters.get(r.dish_name, []),
        }
        for r in count_results
    ]


@router.post("/create-payment-intent")
def create_payment_intent(
    body: dict = Body(...),
    user_code: str = Depends(_require_logged_in),
):
    """Create a Stripe PaymentIntent for a $1 dish request."""
    dish_name = (body.get("dishName") or "").strip().title()
    if not dish_name or len(dish_name) > 200:
        raise HTTPException(status_code=400, detail="Invalid dish name")

    email = (body.get("email") or "").strip().lower()

    intent_kwargs = dict(
        amount=100,
        currency="usd",
        payment_method_types=["card", "link"],
        metadata={
            "dish_name": dish_name,
            "user_code": user_code,
        },
    )
    if email:
        intent_kwargs["receipt_email"] = email

    intent = stripe.PaymentIntent.create(**intent_kwargs)
    return {"clientSecret": intent.client_secret}


@router.post("/confirm")
def confirm_payment(
    body: dict = Body(...),
    user_code: str = Depends(_require_logged_in),
    db: Session = Depends(get_db),
):
    """Verify a PaymentIntent succeeded with Stripe and record the dish request."""
    payment_intent_id = (body.get("paymentIntentId") or "").strip()
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
