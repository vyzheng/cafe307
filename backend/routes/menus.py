"""Menu API: GET current (public), PUT current (vivian only)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Menu
from backend.auth import require_vivian
from backend.schemas import MenuIn, MenuOut

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


def _resolve_lunar(menu: MenuIn) -> str:
    """Accept either camelCase (frontend) or snake_case (Python) lunar date field."""
    return menu.lunarDate or menu.lunar_date or ""


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


@router.post("/archive")
def post_archive_menu(
    menu: MenuIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_vivian),
):
    """Add a menu to the archive (is_current=False). Requires X-Reservation-Code: vivian."""
    courses = [c.model_dump() for c in menu.courses]
    new = Menu(date=menu.date, lunar_date=_resolve_lunar(menu), label=menu.label, courses=courses, is_current=False)
    db.add(new)
    db.commit()
    db.refresh(new)
    return _row_to_menu(new)


@router.put("/current")
def put_current_menu(
    menu: MenuIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_vivian),
):
    """Update the current menu. Previous current is kept as archived (is_current=False). Requires X-Reservation-Code: vivian."""
    courses = [c.model_dump() for c in menu.courses]
    row = db.query(Menu).filter(Menu.is_current == True).first()
    if row:
        row.is_current = False
        db.commit()
    new = Menu(date=menu.date, lunar_date=_resolve_lunar(menu), label=menu.label, courses=courses, is_current=True)
    db.add(new)
    db.commit()
    db.refresh(new)
    return _row_to_menu(new)


@router.patch("/{menu_id}")
def patch_menu(
    menu_id: int,
    menu: MenuIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_vivian),
):
    """Update a menu by id (current or archived). Does not change is_current. Requires X-Reservation-Code: vivian."""
    row = db.query(Menu).filter(Menu.id == menu_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Menu not found")
    row.date = menu.date
    row.lunar_date = _resolve_lunar(menu)
    row.label = menu.label
    row.courses = [c.model_dump() for c in menu.courses]
    db.commit()
    db.refresh(row)
    return _row_to_menu(row)
