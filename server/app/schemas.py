from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# --- User Schemas ---
class UserBase(BaseModel):
    email: str
    full_name: str
    role: str = "student"
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    education_level: str = "Undergraduate"
    university: str = "Indian Institute of Technology / Tier 1 Engineering"
    degree: str = "B.Tech Computer Science"
    graduation_year: int = 2026
    cgpa: float = 8.8
    skills: List[str] = []
    interests: List[str] = []
    target_types: List[str] = []
    location_preference: str = "Hybrid / Remote"
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    notification_preferences: Dict[str, Any] = {}

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    education_level: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    target_types: Optional[List[str]] = None
    location_preference: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    notification_preferences: Optional[Dict[str, Any]] = None

class UserOut(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Opportunity Schemas ---
class OpportunityBase(BaseModel):
    title: str
    organizer: str
    organizer_logo: Optional[str] = None
    category: str
    mode: str = "online"
    location: str = "Remote / All India"
    short_description: str
    full_description: str
    direct_registration_url: str
    official_website_url: Optional[str] = None
    prize_or_stipend_amount: float = 0.0
    prize_currency: str = "INR"
    prize_description: str = "Prizes & Recognition"
    is_free: bool = True
    fee_amount: float = 0.0
    deadline: datetime
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    eligibility_education: List[str] = []
    eligibility_criteria: List[str] = []
    skills_required: List[str] = []
    tags: List[str] = []
    verification_status: str = "VERIFIED_OFFICIAL"
    trust_score: int = 90
    source_platform: str = "Official Partner"
    source_url: Optional[str] = None

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityOut(OpportunityBase):
    id: int
    slug: str
    trust_score: int
    verification_evidence: Dict[str, Any]
    canonical_id: Optional[int] = None
    is_duplicate: bool = False
    merged_sources_count: int = 1
    views_count: int
    clicks_count: int
    applications_count: int
    is_active: bool
    is_featured: bool
    created_at: datetime
    updated_at: datetime
    match_score: Optional[int] = None
    match_reason: Optional[str] = None

    class Config:
        from_attributes = True


# --- Application Tracker Schemas ---
class ApplicationTaskBase(BaseModel):
    title: str
    is_completed: bool = False
    due_date: Optional[datetime] = None
    priority: str = "medium"

class ApplicationTaskCreate(ApplicationTaskBase):
    pass

class ApplicationTaskOut(ApplicationTaskBase):
    id: int
    application_tracker_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationTrackerCreate(BaseModel):
    opportunity_id: int
    status: str = "SAVED"
    notes: Optional[str] = None
    submission_url: Optional[str] = None
    applied_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None

class ApplicationTrackerUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    submission_url: Optional[str] = None
    applied_date: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None

class ApplicationTrackerOut(BaseModel):
    id: int
    user_id: int
    opportunity_id: int
    status: str
    applied_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None
    notes: Optional[str] = None
    submission_url: Optional[str] = None
    match_score: int = 88
    created_at: datetime
    updated_at: datetime
    opportunity: Optional[OpportunityOut] = None
    tasks: List[ApplicationTaskOut] = []

    class Config:
        from_attributes = True


# --- AI Assistance Schemas ---
class MatchAnalysisRequest(BaseModel):
    opportunity_id: int
    user_id: Optional[int] = None

class MatchAnalysisResponse(BaseModel):
    opportunity_id: int
    overall_match_percentage: int
    recommendation_verdict: str
    skills_match: Dict[str, Any]
    eligibility_check: Dict[str, Any]
    strengths: List[str]
    improvement_areas: List[str]
    why_this_matches_you: str

class PrepChecklistRequest(BaseModel):
    opportunity_id: int

class PrepChecklistResponse(BaseModel):
    opportunity_id: int
    opportunity_title: str
    phases: List[Dict[str, Any]]
    key_deliverables: List[str]
    suggested_tech_stack: List[str]
    insider_tips: List[str]

class SOPDraftRequest(BaseModel):
    opportunity_id: int
    target_role_or_track: Optional[str] = None
    personal_experience_highlight: Optional[str] = None

class SOPDraftResponse(BaseModel):
    opportunity_id: int
    subject_line: str
    cover_letter_body: str
    pitch_summary: str
    key_talking_points: List[str]

class OutreachDraftRequest(BaseModel):
    partner_id: Optional[int] = 1
    recipient_name: str
    recipient_college: str
    recipient_email: str
    opportunity_id: Optional[int] = None
    campaign_tone: str = "Inspiring & Professional"

class OutreachDraftResponse(BaseModel):
    subject: str
    body: str
    key_highlights: List[str]


# --- Admin & Partner Schemas ---
class VerificationReviewAction(BaseModel):
    verification_status: str  # VERIFIED_OFFICIAL, COMMUNITY_REPORTED, UNDER_REVIEW, FLAGGED
    trust_score: Optional[int] = None
    notes: Optional[str] = None

class DuplicateMergeAction(BaseModel):
    primary_id: int
    duplicate_ids: List[int]
    notes: Optional[str] = None

class SourceHealthOut(BaseModel):
    id: int
    source_name: str
    connector_type: str
    target_url: str
    last_synced_at: datetime
    status: str
    latency_ms: int
    items_discovered: int
    freshness_score: int
    last_error: Optional[str] = None

    class Config:
        from_attributes = True

class AnalyticsOverviewOut(BaseModel):
    total_opportunities: int
    verified_opportunities: int
    total_applications: int
    active_students: int
    category_distribution: Dict[str, int]
    sources_health_summary: Dict[str, int]
    average_trust_score: float
