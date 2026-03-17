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
    """Return dishes ranked by request count, descending."""
    results = (
        db.query(
            DishRequest.dish_name,
            func.count(DishRequest.id).label("count"),
        )
        .group_by(DishRequest.dish_name)
        .order_by(func.count(DishRequest.id).desc(), DishRequest.dish_name)
        .all()
    )
    return [{"dishName": r.dish_name, "count": r.count} for r in results]


@router.post("/create-payment-intent")
def create_payment_intent(
    body: dict = Body(...),
    user_code: str = Depends(_require_logged_in),
):
    """Create a Stripe PaymentIntent for a $1 dish request."""
    dish_name = (body.get("dishName") or "").strip().title()
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


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook: record the dish request after successful payment."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        intent_id = intent["id"]
        metadata = intent.get("metadata", {})
        dish_name = metadata.get("dish_name", "").strip().title()
        user_code = metadata.get("user_code", "").strip().lower()

        if not dish_name or not user_code:
            return {"status": "skipped", "reason": "missing metadata"}

        existing = db.query(DishRequest).filter(
            DishRequest.stripe_payment_intent_id == intent_id
        ).first()
        if existing:
            return {"status": "already_recorded"}

        new_request = DishRequest(
            dish_name=dish_name,
            user_code=user_code,
            stripe_payment_intent_id=intent_id,
            created_at=datetime.utcnow(),
        )
        db.add(new_request)
        db.commit()

    return {"status": "ok"}
