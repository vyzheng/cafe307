"""Menu API: GET current (public), PUT current (vivian only)."""
from typing import Optional

from fastapi import APIRouter, Body, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Menu

router = APIRouter(prefix="/api/menus", tags=["menus"])


def _row_to_menu(row: Menu) -> dict:
    """Convert DB row to frontend shape (camelCase)."""
    return {
        "id": row.id,
        "date": row.date,
        "lunarDate": row.lunar_date,
        "label": row.label,
        "courses": row.courses or [],
    }


@router.get("/current")
def get_current_menu(db: Session = Depends(get_db)):
    """Return the current menu (public). Same shape as frontend currentMenu."""
    row = db.query(Menu).filter(Menu.is_current == True).first()
    if not row:
        raise HTTPException(status_code=404, detail="No current menu")
    return _row_to_menu(row)


@router.get("/archive")
def get_archive(db: Session = Depends(get_db)):
    """Return past menus (all rows where is_current=False), newest first. Public."""
    rows = db.query(Menu).filter(Menu.is_current == False).order_by(Menu.id.desc()).all()
    return [_row_to_menu(r) for r in rows]


def _require_vivian(x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code")):
    code = (x_reservation_code or "").strip().lower()
    if code != "vivian":
        raise HTTPException(status_code=403, detail="Forbidden")
    return code


@router.post("/archive")
def post_archive_menu(
    menu: dict = Body(...),
    db: Session = Depends(get_db),
    _: str = Depends(_require_vivian),
):
    """Add a menu to the archive (is_current=False). Requires X-Reservation-Code: vivian."""
    date = menu.get("date", "")
    lunar_date = menu.get("lunarDate") or menu.get("lunar_date") or ""
    label = menu.get("label", "")
    courses = menu.get("courses", [])
    new = Menu(date=date, lunar_date=lunar_date, label=label, courses=courses, is_current=False)
    db.add(new)
    db.commit()
    db.refresh(new)
    return _row_to_menu(new)


@router.put("/current")
def put_current_menu(
    menu: dict = Body(...),
    db: Session = Depends(get_db),
    x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code"),
):
    """Update the current menu. Previous current is kept as archived (is_current=False). Requires X-Reservation-Code: vivian."""
    _require_vivian(x_reservation_code)
    # Normalize: accept camelCase from frontend
    date = menu.get("date", "")
    lunar_date = menu.get("lunarDate") or menu.get("lunar_date") or ""
    label = menu.get("label", "")
    courses = menu.get("courses", [])
    row = db.query(Menu).filter(Menu.is_current == True).first()
    if row:
        row.is_current = False  # keep row as archived; do not overwrite
        db.commit()
    new = Menu(date=date, lunar_date=lunar_date, label=label, courses=courses, is_current=True)
    db.add(new)
    db.commit()
    db.refresh(new)
    return _row_to_menu(new)


@router.patch("/{menu_id}")
def patch_menu(
    menu_id: int,
    menu: dict = Body(...),
    db: Session = Depends(get_db),
    x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code"),
):
    """Update a menu by id (current or archived). Does not change is_current. Requires X-Reservation-Code: vivian."""
    _require_vivian(x_reservation_code)
    row = db.query(Menu).filter(Menu.id == menu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Menu not found")
    if "date" in menu:
        row.date = menu.get("date", "")
    if "lunarDate" in menu or "lunar_date" in menu:
        row.lunar_date = menu.get("lunarDate") or menu.get("lunar_date") or ""
    if "label" in menu:
        row.label = menu.get("label", "")
    if "courses" in menu:
        row.courses = menu.get("courses", [])
    db.commit()
    db.refresh(row)
    return _row_to_menu(row)
