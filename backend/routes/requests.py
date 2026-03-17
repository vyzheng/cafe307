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


@router.post("/checkout")
def create_checkout(
    body: dict = Body(...),
    user_code: str = Depends(_require_logged_in),
):
    """Create a Stripe Checkout session for a $1 dish request."""
    dish_name = (body.get("dishName") or "").strip().title()
    if not dish_name or len(dish_name) > 200:
        raise HTTPException(status_code=400, detail="Invalid dish name")

    base_url = os.environ.get("PRODUCTION_URL", "http://localhost:5173")
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[{
            "price_data": {
                "currency": "usd",
                "unit_amount": 100,
                "product_data": {"name": f"Dish Request: {dish_name}"},
            },
            "quantity": 1,
        }],
        mode="payment",
        success_url=f"{base_url}?tab=requests&status=success",
        cancel_url=f"{base_url}?tab=requests&status=cancelled",
        metadata={
            "dish_name": dish_name,
            "user_code": user_code,
        },
    )
    return {"checkoutUrl": session.url}


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

    if event["type"] == "checkout.session.completed":
        session_obj = event["data"]["object"]
        session_id = session_obj["id"]
        metadata = session_obj.get("metadata", {})
        dish_name = metadata.get("dish_name", "").strip().title()
        user_code = metadata.get("user_code", "").strip().lower()

        if not dish_name or not user_code:
            return {"status": "skipped", "reason": "missing metadata"}

        existing = db.query(DishRequest).filter(
            DishRequest.stripe_checkout_session_id == session_id
        ).first()
        if existing:
            return {"status": "already_recorded"}

        new_request = DishRequest(
            dish_name=dish_name,
            user_code=user_code,
            stripe_checkout_session_id=session_id,
            created_at=datetime.utcnow(),
        )
        db.add(new_request)
        db.commit()

    return {"status": "ok"}
