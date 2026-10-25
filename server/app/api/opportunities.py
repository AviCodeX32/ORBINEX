from datetime import datetime
import re
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.database import get_db
from app.models import Opportunity, OpportunityDuplicate, UserBookmark
from app.schemas import OpportunityOut, OpportunityCreate
from app.api.deps import get_current_user
from app.services.verification import verification_engine
from app.services.deduplication import deduplication_engine
from app.services.recommender import recommender_engine

router = APIRouter(prefix="/opportunities", tags=["opportunities"])

def generate_slug(title: str, db: Session) -> str:
    base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    slug = base
    counter = 1
    while db.query(Opportunity).filter(Opportunity.slug == slug).first():
        slug = f"{base}-{counter}"
        counter += 1
    return slug

@router.get("", response_model=List[OpportunityOut])
def list_opportunities(
    q: Optional[str] = Query(None, description="Search keyword in title, organizer, tags"),
    category: Optional[str] = Query(None, description="hackathon, internship, scholarship, fellowship, coding_contest"),
    mode: Optional[str] = Query(None, description="online, in-person, hybrid"),
    status: Optional[str] = Query(None, description="VERIFIED_OFFICIAL, COMMUNITY_REPORTED, UNDER_REVIEW, FLAGGED"),
    is_free: Optional[bool] = Query(None),
    min_prize: Optional[float] = Query(None),
    sort: str = Query("recommended", description="recommended, deadline, newest, prize"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Opportunity).filter(Opportunity.is_active == True)

    # Exclude duplicate non-canonical records from public feed
    query = query.filter(Opportunity.is_duplicate == False)

    if q:
        search_pattern = f"%{q}%"
        query = query.filter(
            or_(
                Opportunity.title.ilike(search_pattern),
                Opportunity.organizer.ilike(search_pattern),
                Opportunity.short_description.ilike(search_pattern),
                Opportunity.location.ilike(search_pattern)
            )
        )

    if category and category.lower() != "all":
        query = query.filter(Opportunity.category == category.lower())

    if mode and mode.lower() != "all":
        query = query.filter(Opportunity.mode == mode.lower())

    if status and status.lower() != "all":
        query = query.filter(Opportunity.verification_status == status)

    if is_free is not None:
        query = query.filter(Opportunity.is_free == is_free)

    if min_prize is not None:
        query = query.filter(Opportunity.prize_or_stipend_amount >= min_prize)

    # Sorting
    if sort == "deadline":
        query = query.order_by(asc(Opportunity.deadline))
    elif sort == "newest":
        query = query.order_by(desc(Opportunity.created_at))
    elif sort == "prize":
        query = query.order_by(desc(Opportunity.prize_or_stipend_amount))
    else:
        # Default: verified first, then deadline
        query = query.order_by(desc(Opportunity.trust_score), asc(Opportunity.deadline))

    results = query.all()

    # Enrich with personalized match score
    user_dict = {
        "skills": current_user.skills,
        "education_level": current_user.education_level,
        "graduation_year": current_user.graduation_year,
        "interests": current_user.interests,
        "target_types": current_user.target_types
    }

    output = []
    for item in results:
        match_info = recommender_engine.score_match(user_dict, item)
        item_out = OpportunityOut.model_validate(item)
        item_out.match_score = match_info["match_percentage"]
        item_out.match_reason = match_info["why_matches"]
        output.append(item_out)

    if sort == "recommended":
        output.sort(key=lambda x: (x.match_score or 0), reverse=True)

    return output


@router.get("/{id_or_slug}", response_model=OpportunityOut)
def get_opportunity(
    id_or_slug: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if id_or_slug.isdigit():
        opp = db.query(Opportunity).filter(Opportunity.id == int(id_or_slug)).first()
    else:
        opp = db.query(Opportunity).filter(Opportunity.slug == id_or_slug).first()

    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Increment view count
    opp.views_count += 1
    db.commit()

    user_dict = {
        "skills": current_user.skills,
        "education_level": current_user.education_level,
        "graduation_year": current_user.graduation_year,
        "interests": current_user.interests,
        "target_types": current_user.target_types
    }
    match_info = recommender_engine.score_match(user_dict, opp)
    
    opp_out = OpportunityOut.model_validate(opp)
    opp_out.match_score = match_info["match_percentage"]
    opp_out.match_reason = match_info["why_matches"]
    return opp_out


@router.post("", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
def create_opportunity(
    data: OpportunityCreate,
    db: Session = Depends(get_db)
):
    # 1. Run Verification Audit
    raw_dict = data.model_dump()
    ver_status, trust_score, evidence = verification_engine.audit_opportunity(raw_dict)

    slug = generate_slug(data.title, db)

    # 2. Check for duplicates among active opportunities
    existing = db.query(Opportunity).filter(Opportunity.is_active == True, Opportunity.is_duplicate == False).all()
    duplicates = deduplication_engine.scan_for_duplicates(raw_dict, existing, threshold=0.75)

    is_dup = False
    canonical_id = None
    if duplicates:
        # Link to top duplicate match
        top_match = duplicates[0]
        is_dup = True
        canonical_id = top_match["existing_id"]

    new_opp = Opportunity(
        slug=slug,
        title=data.title,
        organizer=data.organizer,
        organizer_logo=data.organizer_logo,
        category=data.category,
        mode=data.mode,
        location=data.location,
        short_description=data.short_description,
        full_description=data.full_description,
        direct_registration_url=data.direct_registration_url,
        official_website_url=data.official_website_url,
        prize_or_stipend_amount=data.prize_or_stipend_amount,
        prize_currency=data.prize_currency,
        prize_description=data.prize_description,
        is_free=data.is_free,
        fee_amount=data.fee_amount,
        deadline=data.deadline,
        start_date=data.start_date,
        end_date=data.end_date,
        eligibility_education=data.eligibility_education,
        eligibility_criteria=data.eligibility_criteria,
        skills_required=data.skills_required,
        tags=data.tags,
        verification_status=ver_status,
        trust_score=trust_score,
        verification_evidence=evidence,
        is_duplicate=is_dup,
        canonical_id=canonical_id,
        source_platform=data.source_platform,
        source_url=data.source_url
    )

    db.add(new_opp)
    db.commit()
    db.refresh(new_opp)

    # Record duplicate log if matched
    if duplicates:
        for dup in duplicates:
            log_entry = OpportunityDuplicate(
                primary_id=dup["existing_id"],
                duplicate_id=new_opp.id,
                similarity_score=dup["similarity_score"],
                detection_reason=dup["reason"],
                status="pending_review"
            )
            db.add(log_entry)
        db.commit()

    return OpportunityOut.model_validate(new_opp)


@router.post("/{id}/click")
def track_click(id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == id).first()
    if opp:
        opp.clicks_count += 1
        db.commit()
    return {"status": "ok", "clicks": opp.clicks_count if opp else 0}


@router.post("/discovery/trigger")
def trigger_discovery_agent(
    max_queries: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """
    Triggers an immediate autonomous AI discovery, extraction, verification,
    and deduplication cycle across web sources.
    """
    from app.services.discovery.pipeline import discovery_agent
    results = discovery_agent.run_discovery(db=db, max_queries=max_queries)
    return results


@router.get("/discovery/status")
def get_discovery_status(db: Session = Depends(get_db)):
    """
    Returns the autonomous background discovery scheduler status,
    last run metrics, and source health records.
    """
    from app.services.discovery.scheduler import discovery_scheduler
    from app.models import SourceHealth

    sources = db.query(SourceHealth).all()
    source_stats = [
        {
            "id": s.id,
            "source_name": s.source_name,
            "connector_type": s.connector_type,
            "status": s.status,
            "latency_ms": s.latency_ms,
            "items_discovered": s.items_discovered,
            "last_synced_at": s.last_synced_at.isoformat() if s.last_synced_at else None
        }
        for s in sources
    ]

    return {
        "scheduler": discovery_scheduler.get_status(),
        "sources": source_stats
    }

