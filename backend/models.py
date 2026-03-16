"""DB models for Cafe 307."""
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.sqlite import JSON

from backend.database import Base


class Menu(Base):
    __tablename__ = "menus"

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String(64), nullable=False)
    lunar_date = Column(String(64), nullable=False, default="")
    label = Column(String(256), nullable=False, default="")
    courses = Column(JSON, nullable=False)  # list of {cat: {cn, en}, items: [{cn, en, desc, tag?, exp?}]}
    is_current = Column(Boolean, nullable=False, default=False)


class ChefNote(Base):
    __tablename__ = "chef_notes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    menu_date = Column(String(64), nullable=False, unique=True)
    note = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime, nullable=True)


class VipReview(Base):
    __tablename__ = "vip_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    menu_date = Column(String(64), nullable=False, unique=True)
    review = Column(Text, nullable=False, default="")
    updated_at = Column(DateTime, nullable=True)
