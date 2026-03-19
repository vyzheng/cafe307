"""
Seed the database with the default current menu.

Purpose: on first deployment (or after wiping the DB), this script
populates the menus, chef_notes, and vip_reviews tables with initial
data so the app isn't empty. The menu content mirrors what was
originally hardcoded in the frontend's data/currentMenu.js.

Can be run standalone:  python -m backend.seed
Or imported:            from backend.seed import seed; seed()
"""
import json
import os
import sys

# When running this file directly (python backend/seed.py), Python
# doesn't know "backend" is a package. Adding the repo root to
# sys.path lets "from backend.database import ..." work correctly.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import ChefNote, Menu, VipReview
from backend.database import Base

# Create all tables if they don't exist yet. Safe to call repeatedly --
# create_all is a no-op for tables that already exist.
Base.metadata.create_all(bind=engine)

DEFAULT_MENU_DATE = "March 12, 2026"
DEFAULT_CHEF_NOTE = "七小时的鸡汤。fall off the bone。"
DEFAULT_VIP_REVIEW = "top performer. definitely exceeded my expectations."

# The default menu structure: the inaugural "First Supper" at Cafe 307.
# This matches the nested Course schema from schemas.py / models.py:
#   [{cat: {cn, en}, items: [{cn, en, desc, tag?, exp?}]}]
DEFAULT_MENU = {
    "date": "March 12, 2026",
    "lunarDate": "正月廿四",
    "label": "The First Supper",
    "courses": [
        {
            "cat": {"cn": "前菜", "en": "APPETIZER"},
            "items": [
                {"cn": "滷牛肉", "en": "Five-Spice Braised Beef", "desc": "sliced cold, steeped overnight in star anise & soy"},
                {"cn": "香菇瑤柱雞湯", "en": "Shiitake & Dried Scallop Chicken Broth", "desc": "slow-simmered with jidori chicken"},
            ],
        },
        {
            "cat": {"cn": "主菜", "en": "PLAT PRINCIPAL"},
            "items": [
                {"cn": "黑松露鮮肉餛飩", "en": "Black Truffle Pork Wontons in Broth", "desc": "hand-folded with summer truffle, porcini & rice wine, served in napa cabbage broth with a finish of Eataly truffle oil", "tag": "✿ v3 — finally passed"},
                {"cn": "紅燒肉", "en": "Red-Braised Pork Belly", "desc": "caramelized with rock sugar, slow-braised"},
                {"cn": "蛋黃粽子", "en": "Salted Egg Yolk Zongzi", "desc": "wrapped in bamboo leaves"},
            ],
        },
        {
            "cat": {"cn": "甜品", "en": "DESSERT"},
            "items": [
                {"cn": "巧克力湯圓", "en": "Chocolate Tangyuan", "desc": "Venchi chocolate in fresh glutinous rice dough", "exp": True},
            ],
        },
    ],
}


def seed_notes(db):
    """Seed chef note and VIP review for default menu date if missing."""
    added = False

    # Idempotent: only insert if no row exists for this date yet.
    # This makes the script safe to run multiple times without
    # creating duplicates.
    if not db.query(ChefNote).filter(ChefNote.menu_date == DEFAULT_MENU_DATE).first():
        db.add(ChefNote(menu_date=DEFAULT_MENU_DATE, note=DEFAULT_CHEF_NOTE))
        added = True
    if not db.query(VipReview).filter(VipReview.menu_date == DEFAULT_MENU_DATE).first():
        db.add(VipReview(menu_date=DEFAULT_MENU_DATE, review=DEFAULT_VIP_REVIEW))
        added = True
    if added:
        db.commit()
        print("Seeded chef note and/or VIP review.")


def seed():
    """
    Main seed function. Idempotent: if a current menu already exists,
    it skips seeding to avoid overwriting live data.
    """
    db = SessionLocal()
    try:
        seed_notes(db)

        # Only seed the menu if there's no current menu yet.
        existing = db.query(Menu).filter(Menu.is_current == True).first()
        if existing:
            print("Current menu already exists, skipping seed.")
            return
        row = Menu(
            date=DEFAULT_MENU["date"],
            lunar_date=DEFAULT_MENU["lunarDate"],
            label=DEFAULT_MENU["label"],
            courses=DEFAULT_MENU["courses"],
            is_current=True,
        )
        db.add(row)
        db.commit()
        print("Seeded current menu.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
