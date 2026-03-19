"""
Pydantic request/response models for API validation.

FastAPI uses Pydantic models to automatically validate incoming JSON
request bodies. If a field is missing or has the wrong type, FastAPI
returns a 422 error before the route handler even runs.

We follow an In/Out naming pattern:
  - "In" models (MenuIn, NoteIn, ...) validate incoming request bodies.
  - "Out" models (MenuOut, NoteOut, ...) define the response shape.
This separation lets the request and response have different fields
(e.g. MenuIn accepts data to write; MenuOut includes the DB-assigned id).
"""
from typing import Optional
from pydantic import BaseModel


# ---- Menu course structure ----
#
# These three models mirror the nested JSON structure used for menu
# courses both in the frontend (currentMenu.js) and in the database
# (the Menu.courses JSON column). The hierarchy is:
#   Course -> cat: CourseCategory, items: [CourseItem]
#
# Example: { cat: {cn: "前菜", en: "APPETIZER"},
#            items: [{cn: "滷牛肉", en: "Five-Spice Braised Beef", ...}] }

class CourseCategory(BaseModel):
    """Bilingual category name (e.g. cn="甜品", en="DESSERT")."""
    cn: str = ""
    en: str = ""


class CourseItem(BaseModel):
    """A single dish within a course."""
    cn: str = ""
    en: str = ""
    desc: str = ""
    tag: Optional[str] = None   # e.g. "v3 -- finally passed"
    exp: Optional[bool] = None  # True marks experimental dishes


class Course(BaseModel):
    """One course: a category header + its list of dishes."""
    cat: CourseCategory
    items: list[CourseItem]


class MenuIn(BaseModel):
    """
    Incoming menu payload from the frontend.

    Both lunarDate (camelCase) and lunar_date (snake_case) are accepted
    because the frontend sends camelCase JSON, but Python convention is
    snake_case. The route handler tries lunarDate first, then falls back
    to lunar_date, so either naming works.
    """
    date: str
    lunarDate: Optional[str] = ""
    lunar_date: Optional[str] = ""
    label: str = ""
    courses: list[Course] = []


class MenuOut(BaseModel):
    """Response shape for a menu. Includes the DB-assigned id."""
    id: int
    date: str
    lunarDate: str
    label: str
    courses: list[dict]


class NoteIn(BaseModel):
    """Incoming chef note: which menu date + the note text."""
    menuDate: str
    note: str = ""


class NoteOut(BaseModel):
    """Response shape for a chef note."""
    menuDate: str
    note: str


class ReviewIn(BaseModel):
    """Incoming VIP review: which menu date + the review text."""
    menuDate: str
    review: str = ""


class ReviewOut(BaseModel):
    """Response shape for a VIP review."""
    menuDate: str
    review: str


class DeleteIn(BaseModel):
    """Payload for delete operations: just the menu date to target."""
    menuDate: str


class DeleteOut(BaseModel):
    """Confirmation response for deletes."""
    deleted: bool = True
