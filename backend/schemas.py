"""Pydantic request/response models for API validation."""
from typing import Optional
from pydantic import BaseModel


class CourseCategory(BaseModel):
    cn: str = ""
    en: str = ""


class CourseItem(BaseModel):
    cn: str = ""
    en: str = ""
    desc: str = ""
    tag: Optional[str] = None
    exp: Optional[bool] = None


class Course(BaseModel):
    cat: CourseCategory
    items: list[CourseItem]


class MenuIn(BaseModel):
    date: str
    lunarDate: Optional[str] = ""
    lunar_date: Optional[str] = ""
    label: str = ""
    courses: list[Course] = []


class MenuOut(BaseModel):
    id: int
    date: str
    lunarDate: str
    label: str
    courses: list[dict]


class NoteIn(BaseModel):
    menuDate: str
    note: str = ""


class NoteOut(BaseModel):
    menuDate: str
    note: str


class ReviewIn(BaseModel):
    menuDate: str
    review: str = ""


class ReviewOut(BaseModel):
    menuDate: str
    review: str


class DeleteIn(BaseModel):
    menuDate: str


class DeleteOut(BaseModel):
    deleted: bool = True
