from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import PartnerOrganization, PartnerOutreachMessage, Opportunity
from app.schemas import OpportunityCreate, OpportunityOut
from app.services.verification import verification_engine
from app.api.opportunities import generate_slug
from pydantic import BaseModel

router = APIRouter(prefix="/partner", tags=["partner"])

class PartnerOrgOut(BaseModel):
    id: int
    name: str
    domain: str
    logo_url: Optional[str] = None
    tier: str
    is_verified: bool
    contact_email: str
    website_url: Optional[str] = None
    opportunities_count: int

    class Config:
        from_attributes = True

class OutreachMessageOut(BaseModel):
    id: int
    partner_id: int
    recipient_name: str
    recipient_college: str
    recipient_email: str
    subject: str
    body: str
    campaign_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class OutreachCreate(BaseModel):
    partner_id: int = 1
    recipient_name: str
    recipient_college: str
    recipient_email: str
    subject: str
    body: str
    campaign_name: str = "Campus Ambassador & Hackathon Outreach"

@router.get("/organizations", response_model=List[PartnerOrgOut])
def list_partner_organizations(db: Session = Depends(get_db)):
    orgs = db.query(PartnerOrganization).all()
    return orgs


@router.post("/submit-opportunity", response_model=OpportunityOut, status_code=status.HTTP_201_CREATED)
def submit_partner_opportunity(
    data: OpportunityCreate,
    db: Session = Depends(get_db)
):
    """
    Direct partner submission endpoint with pre-verification check and partner badge.
    """
    raw_dict = data.model_dump()
    raw_dict["source_platform"] = "Partner Submission"
    ver_status, trust_score, evidence = verification_engine.audit_opportunity(raw_dict)
    
    # Partner submissions get verified status if domain matches or baseline valid
    evidence["is_partner_verified_submission"] = True
    slug = generate_slug(data.title, db)

    opp = Opportunity(
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
        verification_status="VERIFIED_OFFICIAL",  # Partners with verified credentials
        trust_score=max(92, trust_score),
        verification_evidence=evidence,
        source_platform="Partner Submission",
        source_url=data.direct_registration_url
    )
    db.add(opp)

    # Increment org opportunity counter
    org = db.query(PartnerOrganization).filter(PartnerOrganization.name == data.organizer).first()
    if org:
        org.opportunities_count += 1

    db.commit()
    db.refresh(opp)
    return opp


@router.get("/outreach-messages", response_model=List[OutreachMessageOut])
def list_outreach_messages(
    partner_id: int = 1,
    db: Session = Depends(get_db)
):
    msgs = db.query(PartnerOutreachMessage).filter(PartnerOutreachMessage.partner_id == partner_id).all()
    return msgs


@router.post("/outreach-messages", response_model=OutreachMessageOut, status_code=status.HTTP_201_CREATED)
def save_outreach_message(
    data: OutreachCreate,
    db: Session = Depends(get_db)
):
    msg = PartnerOutreachMessage(
        partner_id=data.partner_id,
        recipient_name=data.recipient_name,
        recipient_college=data.recipient_college,
        recipient_email=data.recipient_email,
        subject=data.subject,
        body=data.body,
        campaign_name=data.campaign_name,
        status="approved"
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


@router.post("/outreach-messages/{id}/send")
def send_outreach_message(id: int, db: Session = Depends(get_db)):
    msg = db.query(PartnerOutreachMessage).filter(PartnerOutreachMessage.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Outreach message not found")
    msg.status = "sent"
    msg.sent_at = datetime.utcnow()
    db.commit()
    return {"status": "sent", "id": id, "sent_at": msg.sent_at.isoformat()}
