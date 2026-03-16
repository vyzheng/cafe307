"""Notes API: chef notes (vivian write), VIP reviews (vlad write). GET is public."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import ChefNote, VipReview
from backend.auth import require_vivian, require_vlad
from backend.schemas import NoteIn, NoteOut, ReviewIn, ReviewOut, DeleteIn, DeleteOut

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("/chef", response_model=NoteOut)
def get_chef_note(
    menuDate: str = Query(..., alias="menuDate"),
    db: Session = Depends(get_db),
):
    """Return the chef note for the given menu date. Public."""
    row = db.query(ChefNote).filter(ChefNote.menu_date == menuDate).first()
    if not row:
        raise HTTPException(status_code=404, detail="No chef note for this date")
    return NoteOut(menuDate=row.menu_date, note=row.note or "")


@router.put("/chef", response_model=NoteOut)
def put_chef_note(
    body: NoteIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_vivian),
):
    """Upsert chef note by menu date. Requires X-Reservation-Code: vivian."""
    menu_date = body.menuDate.strip()
    if not menu_date:
        raise HTTPException(status_code=400, detail="menuDate is required")
    note = body.note.strip()
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
    return NoteOut(menuDate=row.menu_date, note=row.note or "")


@router.delete("/chef", response_model=DeleteOut)
def delete_chef_note(
    body: DeleteIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_vivian),
):
    """Delete chef note for a menu date. Requires X-Reservation-Code: vivian."""
    menu_date = body.menuDate.strip()
    if not menu_date:
        raise HTTPException(status_code=400, detail="menuDate is required")
    row = db.query(ChefNote).filter(ChefNote.menu_date == menu_date).first()
    if not row:
        raise HTTPException(status_code=404, detail="No chef note for this date")
    db.delete(row)
    db.commit()
    return DeleteOut()


@router.get("/vip-review", response_model=ReviewOut)
def get_vip_review(
    menuDate: str = Query(..., alias="menuDate"),
    db: Session = Depends(get_db),
):
    """Return the VIP/guest review for the given menu date. Public."""
    row = db.query(VipReview).filter(VipReview.menu_date == menuDate).first()
    if not row:
        raise HTTPException(status_code=404, detail="No VIP review for this date")
    return ReviewOut(menuDate=row.menu_date, review=row.review or "")


@router.put("/vip-review", response_model=ReviewOut)
def put_vip_review(
    body: ReviewIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_vlad),
):
    """Upsert VIP review by menu date. Requires X-Reservation-Code: vlad."""
    menu_date = body.menuDate.strip()
    if not menu_date:
        raise HTTPException(status_code=400, detail="menuDate is required")
    review = body.review.strip()
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
    return ReviewOut(menuDate=row.menu_date, review=row.review or "")


@router.delete("/vip-review", response_model=DeleteOut)
def delete_vip_review(
    body: DeleteIn,
    db: Session = Depends(get_db),
    _: str = Depends(require_vlad),
):
    """Delete VIP review for a menu date. Requires X-Reservation-Code: vlad."""
    menu_date = body.menuDate.strip()
    if not menu_date:
        raise HTTPException(status_code=400, detail="menuDate is required")
    row = db.query(VipReview).filter(VipReview.menu_date == menu_date).first()
    if not row:
        raise HTTPException(status_code=404, detail="No VIP review for this date")
    db.delete(row)
    db.commit()
    return DeleteOut()
