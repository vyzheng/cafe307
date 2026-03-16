"""Seed the database with the default current menu (from frontend data/currentMenu.js)."""
import json
import os
import sys

# Run from repo root so backend is a package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import SessionLocal, engine
from backend.models import ChefNote, Menu, VipReview
from backend.database import Base

Base.metadata.create_all(bind=engine)

DEFAULT_MENU_DATE = "March 12, 2026"
DEFAULT_CHEF_NOTE = "七小时的鸡汤。fall off the bone。"
DEFAULT_VIP_REVIEW = "top performer. definitely exceeded my expectations."

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
    db = SessionLocal()
    try:
        seed_notes(db)
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
