from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # 'student', 'admin', 'partner'
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)

    # Academic & Career details
    education_level = Column(String(100), default="Undergraduate")  # Undergraduate, Postgraduate, Recent Graduate, High School
    university = Column(String(255), default="Indian Institute of Technology / Tier 1 Engineering")
    degree = Column(String(100), default="B.Tech Computer Science")
    graduation_year = Column(Integer, default=2026)
    cgpa = Column(Float, default=8.8)

    # Preferences & Skills
    skills = Column(JSON, default=lambda: ["Python", "Machine Learning", "FastAPI", "React", "TypeScript", "Data Structures"])
    interests = Column(JSON, default=lambda: ["AI/ML", "Web Development", "Open Source", "FinTech", "Hackathons"])
    target_types = Column(JSON, default=lambda: ["hackathon", "internship", "fellowship", "scholarship"])
    location_preference = Column(String(100), default="Hybrid / Remote")

    # Socials & Resume
    github_url = Column(String(255), default="https://github.com")
    linkedin_url = Column(String(255), default="https://linkedin.com")
    portfolio_url = Column(String(255), default="https://portfolio.dev")
    resume_url = Column(String(500), nullable=True)
    resume_text = Column(Text, nullable=True)

    # Notifications
    notification_preferences = Column(JSON, default=lambda: {
        "email_alerts": True,
        "deadline_reminders": True,
        "daily_digest": False,
        "verified_only": True
    })

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applications = relationship("ApplicationTracker", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("UserBookmark", back_populates="user", cascade="all, delete-orphan")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(300), unique=True, index=True, nullable=False)
    title = Column(String(300), index=True, nullable=False)
    organizer = Column(String(255), index=True, nullable=False)
    organizer_logo = Column(String(500), nullable=True)
    category = Column(String(50), index=True, nullable=False)  # hackathon, internship, scholarship, fellowship, coding_contest, grant
    mode = Column(String(50), default="online")  # online, in-person, hybrid
    location = Column(String(255), default="Remote / All India")

    short_description = Column(String(500), nullable=False)
    full_description = Column(Text, nullable=False)

    direct_registration_url = Column(String(500), nullable=False)
    official_website_url = Column(String(500), nullable=True)

    prize_or_stipend_amount = Column(Float, default=0.0)
    prize_currency = Column(String(10), default="INR")
    prize_description = Column(String(255), default="₹5,00,000 Prize Pool")

    is_free = Column(Boolean, default=True)
    fee_amount = Column(Float, default=0.0)

    deadline = Column(DateTime, nullable=False, index=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)

    eligibility_education = Column(JSON, default=lambda: ["Undergraduate", "Postgraduate", "Recent Graduate"])
    eligibility_criteria = Column(JSON, default=lambda: ["Open to enrolled college students & recent 2024-2026 batches", "Team size: 1-4 members"])
    skills_required = Column(JSON, default=lambda: ["Python", "JavaScript", "Problem Solving"])
    tags = Column(JSON, default=lambda: ["AI", "Web3", "Cloud"])

    # Verification Engine Fields
    verification_status = Column(String(50), default="VERIFIED_OFFICIAL", index=True)  # VERIFIED_OFFICIAL, COMMUNITY_REPORTED, UNDER_REVIEW, FLAGGED
    trust_score = Column(Integer, default=95)  # 0 to 100
    verification_evidence = Column(JSON, default=lambda: {
        "domain_verified": True,
        "ssl_secure": True,
        "registration_link_tested": True,
        "source_credibility": "High",
        "last_checked_iso": datetime.utcnow().isoformat(),
        "verified_by": "ORBINEX Source Intelligence"
    })

    # Deduplication & Canonical grouping
    canonical_id = Column(Integer, nullable=True, index=True)  # self-referencing ID if duplicate of another
    is_duplicate = Column(Boolean, default=False)
    merged_sources_count = Column(Integer, default=1)

    source_platform = Column(String(100), default="Official Partner")  # Devfolio, Unstop, Devpost, Official, Partner Submission
    source_url = Column(String(500), nullable=True)

    views_count = Column(Integer, default=120)
    clicks_count = Column(Integer, default=45)
    applications_count = Column(Integer, default=18)

    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applications = relationship("ApplicationTracker", back_populates="opportunity", cascade="all, delete-orphan")
    bookmarks = relationship("UserBookmark", back_populates="opportunity", cascade="all, delete-orphan")


class OpportunityDuplicate(Base):
    __tablename__ = "opportunity_duplicates"

    id = Column(Integer, primary_key=True, index=True)
    primary_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    duplicate_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    similarity_score = Column(Float, default=0.92)
    detection_reason = Column(String(255), default="High title similarity and identical registration domain")
    status = Column(String(50), default="pending_review")  # pending_review, merged, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)


class ApplicationTracker(Base):
    __tablename__ = "application_trackers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    status = Column(String(50), default="SAVED", index=True)  # SAVED, APPLIED, UNDER_REVIEW, INTERVIEW_ROUND, ACCEPTED, REJECTED
    applied_date = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    submission_url = Column(String(500), nullable=True)
    match_score = Column(Integer, default=88)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="applications")
    opportunity = relationship("Opportunity", back_populates="applications")
    tasks = relationship("ApplicationTask", back_populates="tracker", cascade="all, delete-orphan")


class ApplicationTask(Base):
    __tablename__ = "application_tasks"

    id = Column(Integer, primary_key=True, index=True)
    application_tracker_id = Column(Integer, ForeignKey("application_trackers.id"), nullable=False)
    title = Column(String(300), nullable=False)
    is_completed = Column(Boolean, default=False)
    due_date = Column(DateTime, nullable=True)
    priority = Column(String(20), default="medium")  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)

    tracker = relationship("ApplicationTracker", back_populates="tasks")


class UserBookmark(Base):
    __tablename__ = "user_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookmarks")
    opportunity = relationship("Opportunity", back_populates="bookmarks")


class PartnerOrganization(Base):
    __tablename__ = "partner_organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=False)
    logo_url = Column(String(500), nullable=True)
    tier = Column(String(50), default="verified_partner")  # verified_partner, university_partner, community
    is_verified = Column(Boolean, default=True)
    contact_email = Column(String(255), nullable=False)
    website_url = Column(String(500), nullable=True)
    opportunities_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    outreach_messages = relationship("PartnerOutreachMessage", back_populates="partner", cascade="all, delete-orphan")


class PartnerOutreachMessage(Base):
    __tablename__ = "partner_outreach_messages"

    id = Column(Integer, primary_key=True, index=True)
    partner_id = Column(Integer, ForeignKey("partner_organizations.id"), nullable=False)
    recipient_name = Column(String(255), nullable=False)
    recipient_college = Column(String(255), nullable=False)
    recipient_email = Column(String(255), nullable=False)
    subject = Column(String(300), nullable=False)
    body = Column(Text, nullable=False)
    campaign_name = Column(String(255), default="Campus Ambassador & Hackathon Outreach")
    status = Column(String(50), default="draft")  # draft, approved, sent
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    partner = relationship("PartnerOrganization", back_populates="outreach_messages")


class SourceHealth(Base):
    __tablename__ = "source_healths"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), nullable=False)
    connector_type = Column(String(50), default="API")  # API, RSS_FEED, HTML_PARSER, PARTNER_WEBHOOK
    target_url = Column(String(500), nullable=False)
    last_synced_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default="healthy")  # healthy, degraded, offline
    latency_ms = Column(Integer, default=180)
    items_discovered = Column(Integer, default=42)
    last_error = Column(String(500), nullable=True)
    freshness_score = Column(Integer, default=98)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
