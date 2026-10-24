from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserBookmark, Opportunity
from app.schemas import UserOut, UserProfileUpdate, OpportunityOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/profile", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/profile", response_model=UserOut)
def update_profile(
    updates: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/bookmarks", response_model=List[OpportunityOut])
def get_user_bookmarks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookmarks = db.query(UserBookmark).filter(UserBookmark.user_id == current_user.id).all()
    opp_ids = [b.opportunity_id for b in bookmarks]
    opps = db.query(Opportunity).filter(Opportunity.id.in_(opp_ids)).all()
    return opps


@router.post("/bookmarks/{opportunity_id}")
def toggle_bookmark(
    opportunity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = db.query(UserBookmark).filter(
        UserBookmark.user_id == current_user.id,
        UserBookmark.opportunity_id == opportunity_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"bookmarked": False, "opportunity_id": opportunity_id}
    else:
        new_bm = UserBookmark(user_id=current_user.id, opportunity_id=opportunity_id)
        db.add(new_bm)
        db.commit()
        return {"bookmarked": True, "opportunity_id": opportunity_id}
