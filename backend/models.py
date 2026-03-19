"""
DB models for Cafe 307.

Each class maps to a SQLite table via SQLAlchemy's ORM.
The app has four tables:
  menus          -- dinner menus (current + archived)
  chef_notes     -- Vivian's notes for each menu date
  vip_reviews    -- Vlad's guest reviews for each menu date
  dish_requests  -- $1 Stripe-paid requests for future dishes
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.sqlite import JSON

from backend.database import Base


class Menu(Base):
    """
    A dinner menu for a specific date. One row is marked is_current=True;
    all others are archived past menus. When Vivian publishes a new menu,
    the old current row gets is_current=False (kept for the archive page).
    """
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String(64), nullable=False)
    lunar_date = Column(String(64), nullable=False, default="")
    label = Column(String(256), nullable=False, default="")

    # courses is stored as a JSON column in SQLite. It holds the full
    # nested menu structure: a list of course dicts, each with a "cat"
    # (category like Appetizer/Dessert) and "items" (individual dishes).
    # Schema: [{cat: {cn, en}, items: [{cn, en, desc, tag?, exp?}]}]
    # Using JSON here avoids needing separate tables for courses/items
    # since menus are always read and written as a whole.
    courses = Column(JSON, nullable=False)

    # Only one menu should have is_current=True at any time.
    is_current = Column(Boolean, nullable=False, default=False)


class ChefNote(Base):
    """
    Vivian's cooking notes for a menu date (e.g. "seven-hour chicken broth").
    One note per menu date -- the unique constraint on menu_date enforces this.
    """
    __tablename__ = "chef_notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    # unique=True ensures at most one chef note per menu date.
    menu_date = Column(String(64), nullable=False, unique=True)
    note = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime, nullable=True)


class VipReview(Base):
    """
    Vlad's guest review for a menu date. Same one-per-date pattern as ChefNote.
    """
    __tablename__ = "vip_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    menu_date = Column(String(64), nullable=False, unique=True)
    review = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime, nullable=True)


class DishRequest(Base):
    """
    A paid dish request: a guest pays $1 via Stripe to vote for a dish
    they want on a future menu. The most-requested dishes rise to the top.
    """
    __tablename__ = "dish_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dish_name = Column(String(256), nullable=False)
    # user_code identifies who made the request (e.g. "vlad", "mushu").
    user_code = Column(String(64), nullable=False)

    # stripe_payment_intent_id is unique to prevent double-recording.
    # After Stripe confirms payment, the /confirm endpoint checks this
    # column -- if the PaymentIntent ID already exists, it returns
    # "already_recorded" instead of inserting a duplicate. This makes
    # the confirm endpoint idempotent (safe to call multiple times).
    stripe_payment_intent_id = Column(String(256), nullable=False, unique=True)

    created_at = Column(DateTime, nullable=False)
