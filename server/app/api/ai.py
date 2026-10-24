from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Opportunity
from app.schemas import (
    MatchAnalysisRequest, MatchAnalysisResponse,
    PrepChecklistRequest, PrepChecklistResponse,
    SOPDraftRequest, SOPDraftResponse,
    OutreachDraftRequest, OutreachDraftResponse
)
from app.api.deps import get_current_user
from app.services.recommender import recommender_engine
from app.services.ai_assistant import ai_assistant

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/match-analysis", response_model=MatchAnalysisResponse)
def analyze_match(
    req: MatchAnalysisRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    user_dict = {
        "skills": current_user.skills,
        "education_level": current_user.education_level,
        "graduation_year": current_user.graduation_year,
        "interests": current_user.interests,
        "target_types": current_user.target_types
    }
    match_data = recommender_engine.score_match(user_dict, opp)
    percentage = match_data["match_percentage"]

    if percentage >= 85:
        verdict = "Strong Match — Highly Recommended"
    elif percentage >= 70:
        verdict = "Solid Fit — Competitive Candidate"
    else:
        verdict = "Moderate Alignment — Good for Skill Building"

    strengths = [
        f"Demonstrated proficiency in {', '.join(match_data['matched_skills'])}" if match_data['matched_skills'] else "Solid foundational background",
        f"Education eligibility confirmed for {current_user.education_level}",
        f"Active interest profile in {opp.category.title()}"
    ]

    improvements = []
    if match_data["missing_skills"]:
        improvements.append(f"Consider reviewing or teaming up with someone skilled in: {', '.join(match_data['missing_skills'][:2])}")
    else:
        improvements.append("Ensure your project deck clearly quantifies measurable impact")

    return MatchAnalysisResponse(
        opportunity_id=opp.id,
        overall_match_percentage=percentage,
        recommendation_verdict=verdict,
        skills_match={
            "matched": match_data["matched_skills"],
            "missing": match_data["missing_skills"],
            "coverage_rate": f"{len(match_data['matched_skills'])} of {len(opp.skills_required or ['Tech'])} required skills"
        },
        eligibility_check={
            "is_eligible": match_data["is_education_eligible"],
            "degree_requirement": opp.eligibility_education or ["Open to All"],
            "user_degree": current_user.education_level
        },
        strengths=strengths,
        improvement_areas=improvements,
        why_this_matches_you=match_data["why_matches"]
    )


@router.post("/prep-checklist", response_model=PrepChecklistResponse)
def get_prep_checklist(
    req: PrepChecklistRequest,
    db: Session = Depends(get_db)
):
    opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    res = ai_assistant.generate_prep_checklist(opp)
    return PrepChecklistResponse(**res)


@router.post("/sop-draft", response_model=SOPDraftResponse)
def draft_sop(
    req: SOPDraftRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    res = ai_assistant.draft_statement_of_purpose(opp, current_user, req.target_role_or_track)
    return SOPDraftResponse(**res)


@router.post("/partner-outreach", response_model=OutreachDraftResponse)
def draft_partner_outreach(
    req: OutreachDraftRequest,
    db: Session = Depends(get_db)
):
    opp_title = None
    if req.opportunity_id:
        opp = db.query(Opportunity).filter(Opportunity.id == req.opportunity_id).first()
        if opp:
            opp_title = opp.title

    partner_name = "ORBINEX Partner Network"
    res = ai_assistant.draft_partner_outreach(
        partner_name=partner_name,
        recipient_name=req.recipient_name,
        recipient_college=req.recipient_college,
        opp_title=opp_title
    )
    return OutreachDraftResponse(**res)
