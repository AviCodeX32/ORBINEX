from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Opportunity, OpportunityDuplicate, SourceHealth, User, ApplicationTracker
from app.schemas import (
    OpportunityOut, VerificationReviewAction, DuplicateMergeAction,
    SourceHealthOut, AnalyticsOverviewOut
)

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/verification-queue", response_model=List[OpportunityOut])
def get_verification_queue(
    status_filter: str = Query("ALL", description="ALL, UNDER_REVIEW, FLAGGED, COMMUNITY_REPORTED, VERIFIED_OFFICIAL"),
    db: Session = Depends(get_db)
):
    query = db.query(Opportunity)
    if status_filter != "ALL":
        query = query.filter(Opportunity.verification_status == status_filter)
    else:
        # Prioritize items needing review
        query = query.filter(Opportunity.verification_status.in_(["UNDER_REVIEW", "FLAGGED", "COMMUNITY_REPORTED"]))
    
    return query.order_by(Opportunity.trust_score.asc()).all()


@router.post("/verification-review/{id}", response_model=OpportunityOut)
def review_opportunity_status(
    id: int,
    action: VerificationReviewAction,
    db: Session = Depends(get_db)
):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    opp.verification_status = action.verification_status
    if action.trust_score is not None:
        opp.trust_score = action.trust_score
    else:
        if action.verification_status == "VERIFIED_OFFICIAL":
            opp.trust_score = max(88, opp.trust_score)
        elif action.verification_status == "FLAGGED":
            opp.trust_score = min(35, opp.trust_score)

    evidence = dict(opp.verification_evidence or {})
    evidence["admin_reviewed_at"] = datetime.utcnow().isoformat()
    if action.notes:
        evidence["admin_notes"] = action.notes
    evidence["manual_override"] = True
    opp.verification_evidence = evidence

    db.commit()
    db.refresh(opp)
    return opp


@router.get("/duplicates")
def get_duplicate_candidates(db: Session = Depends(get_db)):
    duplicates = db.query(OpportunityDuplicate).filter(OpportunityDuplicate.status == "pending_review").all()
    results = []
    for d in duplicates:
        primary = db.query(Opportunity).filter(Opportunity.id == d.primary_id).first()
        duplicate = db.query(Opportunity).filter(Opportunity.id == d.duplicate_id).first()
        if primary and duplicate:
            results.append({
                "id": d.id,
                "similarity_score": d.similarity_score,
                "detection_reason": d.detection_reason,
                "created_at": d.created_at,
                "primary": OpportunityOut.model_validate(primary),
                "duplicate": OpportunityOut.model_validate(duplicate)
            })
    return results


@router.post("/duplicates/merge")
def merge_duplicate_records(action: DuplicateMergeAction, db: Session = Depends(get_db)):
    primary = db.query(Opportunity).filter(Opportunity.id == action.primary_id).first()
    if not primary:
        raise HTTPException(status_code=404, detail="Primary opportunity not found")

    merged_count = 0
    for dup_id in action.duplicate_ids:
        dup = db.query(Opportunity).filter(Opportunity.id == dup_id).first()
        if dup and dup.id != primary.id:
            dup.is_duplicate = True
            dup.canonical_id = primary.id
            dup.is_active = False
            merged_count += 1

            # Update duplicate log
            log_item = db.query(OpportunityDuplicate).filter(
                OpportunityDuplicate.primary_id == primary.id,
                OpportunityDuplicate.duplicate_id == dup.id
            ).first()
            if log_item:
                log_item.status = "merged"

    primary.merged_sources_count += merged_count
    db.commit()
    return {"status": "success", "primary_id": primary.id, "merged_records": merged_count}


@router.get("/source-health", response_model=List[SourceHealthOut])
def get_source_health(db: Session = Depends(get_db)):
    sources = db.query(SourceHealth).all()
    return sources


@router.post("/source-health/sync-now")
def trigger_source_sync(db: Session = Depends(get_db)):
    sources = db.query(SourceHealth).all()
    for s in sources:
        s.last_synced_at = datetime.utcnow()
        s.items_discovered += 3
        s.freshness_score = min(100, s.freshness_score + 2)
        s.status = "healthy"
    db.commit()
    return {"status": "synced", "sources_updated": len(sources), "timestamp": datetime.utcnow().isoformat()}


@router.get("/analytics", response_model=AnalyticsOverviewOut)
def get_platform_analytics(db: Session = Depends(get_db)):
    total_opps = db.query(Opportunity).count()
    verified_opps = db.query(Opportunity).filter(Opportunity.verification_status == "VERIFIED_OFFICIAL").count()
    total_apps = db.query(ApplicationTracker).count()
    active_students = db.query(User).count()

    # Category breakdown
    categories = db.query(Opportunity.category, func.count(Opportunity.id)).group_by(Opportunity.category).all()
    cat_dist = {cat: count for cat, count in categories}

    # Sources summary
    sources = db.query(SourceHealth).all()
    source_stats = {
        "healthy": len([s for s in sources if s.status == "healthy"]),
        "degraded": len([s for s in sources if s.status == "degraded"]),
        "offline": len([s for s in sources if s.status == "offline"])
    }

    avg_trust = db.query(func.avg(Opportunity.trust_score)).scalar() or 88.5

    return AnalyticsOverviewOut(
        total_opportunities=total_opps,
        verified_opportunities=verified_opps,
        total_applications=total_apps,
        active_students=active_students,
        category_distribution=cat_dist,
        sources_health_summary=source_stats,
        average_trust_score=round(float(avg_trust), 1)
    )
