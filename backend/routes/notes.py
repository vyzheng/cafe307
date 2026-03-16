"""Notes API: chef notes (vivian write), VIP reviews (vlad write). GET is public."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Body, Depends, Header, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import ChefNote, VipReview

router = APIRouter(prefix="/api/notes", tags=["notes"])


def _require_vivian(x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code")):
    code = (x_reservation_code or "").strip().lower()
    if code != "vivian":
        raise HTTPException(status_code=403, detail="Forbidden")
    return code


def _require_vlad(x_reservation_code: Optional[str] = Header(default=None, alias="X-Reservation-Code")):
    code = (x_reservation_code or "").strip().lower()
    if code != "vlad":
        raise HTTPException(status_code=403, detail="Forbidden")
    return code


@router.get("/chef")
def get_chef_note(
    menuDate: str = Query(..., alias="menuDate"),
    db: Session = Depends(get_db),
):
    """Return the chef note for the given menu date. Public."""
    row = db.query(ChefNote).filter(ChefNote.menu_date == menuDate).first()
    if not row:
        raise HTTPException(status_code=404, detail="No chef note for this date")
    return {"menuDate": row.menu_date, "note": row.note or ""}


@router.put("/chef")
def put_chef_note(
    body: dict = Body(...),
    db: Session = Depends(get_db),
    _: str = Depends(_require_vivian),
):
    """Upsert chef note by menu date. Requires X-Reservation-Code: vivian."""
    menu_date = (body.get("menuDate") or "").strip()
    if not menu_date:
        raise HTTPException(status_code=400, detail="menuDate is required")
    note = (body.get("note") or "").strip()
    row = db.query(ChefNote).filter(ChefNote.menu_date == menu_date).first()
    if row:
        row.note = note
        row.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(row)
    else:
        row = ChefNote(menu_date=menu_date, note=note, updated_at=datetime.utcnow())
        db.add(row)
        db.commit()
        db.refresh(row)
    return {"menuDate": row.menu_date, "note": row.note or ""}


@router.delete("/chef")
def delete_chef_note(
    body: dict = Body(...),
    db: Session = Depends(get_db),
    _: str = Depends(_require_vivian),
):
    """Delete chef note for a menu date. Requires X-Reservation-Code: vivian."""
    menu_date = (body.get("menuDate") or "").strip()
    if not menu_date:
        raise HTTPException(status_code=400, detail="menuDate is required")
    row = db.query(ChefNote).filter(ChefNote.menu_date == menu_date).first()
    if not row:
        raise HTTPException(status_code=404, detail="No chef note for this date")
    db.delete(row)
    db.commit()
    return {"deleted": True}


@router.get("/vip-review")
def get_vip_review(
    menuDate: str = Query(..., alias="menuDate"),
    db: Session = Depends(get_db),
):
    """Return the VIP/guest review for the given menu date. Public."""
    row = db.query(VipReview).filter(VipReview.menu_date == menuDate).first()
    if not row:
        raise HTTPException(status_code=404, detail="No VIP review for this date")
    return {"menuDate": row.menu_date, "review": row.review or ""}


@router.put("/vip-review")
def put_vip_review(
    body: dict = Body(...),
    db: Session = Depends(get_db),
    _: str = Depends(_require_vlad),
):
    """Upsert VIP review by menu date. Requires X-Reservation-Code: vlad."""
    menu_date = (body.get("menuDate") or "").strip()
    if not menu_date:
        raise HTTPException(status_code=400, detail="menuDate is required")
    review = (body.get("review") or "").strip()
    row = db.query(VipReview).filter(VipReview.menu_date == menu_date).first()
    if row:
        row.review = review
        row.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(row)
    else:
        row = VipReview(menu_date=menu_date, review=review, updated_at=datetime.utcnow())
        db.add(row)
        db.commit()
        db.refresh(row)
    return {"menuDate": row.menu_date, "review": row.review or ""}


@router.delete("/vip-review")
def delete_vip_review(
    body: dict = Body(...),
    db: Session = Depends(get_db),
    _: str = Depends(_require_vlad),
):
    """Delete VIP review for a menu date. Requires X-Reservation-Code: vlad."""
    menu_date = (body.get("menuDate") or "").strip()
    if not menu_date:
        raise HTTPException(status_code=400, detail="menuDate is required")
    row = db.query(VipReview).filter(VipReview.menu_date == menu_date).first()
    if not row:
        raise HTTPException(status_code=404, detail="No VIP review for this date")
    db.delete(row)
    db.commit()
    return {"deleted": True}
