import re
import time
import logging
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Opportunity, OpportunityDuplicate, SourceHealth
from app.services.discovery.search_provider import get_active_search_provider
from app.services.discovery.extractor import StructuredExtractor, OpportunityCandidate
from app.services.verification import VerificationEngine
from app.services.deduplication import DeduplicationEngine

logger = logging.getLogger("orbinex.discovery.pipeline")

class OpportunityDiscoveryAgent:
    """
    Autonomous AI Opportunity Discovery Agent.
    Implements the complete pipeline:
    Discover -> Extract -> Verify -> Deduplicate -> Store -> Audit
    """

    def __init__(self):
        self.search_provider = get_active_search_provider()

    @staticmethod
    def generate_slug(title: str, organizer: str, db: Session) -> str:
        """
        Generates a clean URL slug ensuring database uniqueness.
        """
        combined = f"{organizer}-{title}".lower()
        cleaned = re.sub(r'[^a-z0-9\s-]', '', combined)
        slug = re.sub(r'[\s-]+', '-', cleaned).strip('-')[:250]
        if not slug:
            slug = f"opportunity-{int(time.time())}"

        # Ensure uniqueness
        base_slug = slug
        counter = 1
        while db.query(Opportunity).filter(Opportunity.slug == slug).first() is not None:
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug

    def run_discovery(self, db: Session, max_queries: int = 4) -> Dict[str, Any]:
        """
        Executes an end-to-end discovery cycle.
        """
        start_time = time.time()
        logger.info("Starting AI Opportunity Discovery cycle...")

        search_queries = [
            "premier student hackathons 2026 registration open",
            "graduate software engineer 2026 batch full time hiring India",
            "coding competition innovation grand prix 2026 students",
            "summer software engineering internship 2026"
        ]

        discovered_items = []
        for q in search_queries[:max_queries]:
            try:
                results = self.search_provider.search_opportunities(q, max_results=3)
                discovered_items.extend(results)
            except Exception as e:
                logger.error(f"Search provider error on query '{q}': {e}")

        total_discovered = len(discovered_items)
        stored_count = 0
        merged_count = 0
        duplicates_flagged = 0
        details = []

        # Fetch existing opportunities for deduplication checks
        existing_opps = db.query(Opportunity).all()

        for item in discovered_items:
            try:
                # 1. Structured Extraction (Pydantic validated)
                candidate: OpportunityCandidate = StructuredExtractor.extract(
                    raw_title=item.title,
                    raw_snippet=item.snippet,
                    source_url=item.url,
                    source_name=item.source_name,
                    category_hint=getattr(item, "category_hint", None)
                )

                candidate_dict = candidate.model_dump()

                # 2. Evidence Verification & Trust Auditing
                status, trust_score, evidence = VerificationEngine.audit_opportunity(candidate_dict)

                # 3. Deduplication Check
                duplicate_match = None
                for existing in existing_opps:
                    sim = DeduplicationEngine.calculate_similarity(
                        candidate.title,
                        candidate.organizer,
                        existing.title,
                        existing.organizer,
                        candidate.direct_registration_url,
                        existing.direct_registration_url
                    )

                    # Exact or high confidence duplicate
                    if sim >= settings.DEDUPLICATION_SIMILARITY_THRESHOLD or (
                        candidate.direct_registration_url and 
                        candidate.direct_registration_url == existing.direct_registration_url
                    ):
                        duplicate_match = (existing, sim)
                        break

                if duplicate_match:
                    existing_record, sim_score = duplicate_match
                    if sim_score >= 0.88 or candidate.direct_registration_url == existing_record.direct_registration_url:
                        # Merge into existing canonical record
                        existing_record.merged_sources_count = (existing_record.merged_sources_count or 1) + 1
                        existing_record.updated_at = datetime.utcnow()
                        merged_count += 1
                        details.append({
                            "title": candidate.title,
                            "action": "MERGED_INTO_EXISTING",
                            "canonical_id": existing_record.id,
                            "similarity": sim_score
                        })
                    else:
                        # Log near duplicate to review queue
                        dup_entry = OpportunityDuplicate(
                            primary_id=existing_record.id,
                            duplicate_id=existing_record.id,
                            similarity_score=sim_score,
                            detection_reason=f"Similarity score {int(sim_score * 100)}% with {existing_record.title}",
                            status="pending_review"
                        )
                        db.add(dup_entry)
                        duplicates_flagged += 1
                    continue

                # 4. Storage into Database
                slug = self.generate_slug(candidate.title, candidate.organizer, db)

                new_opp = Opportunity(
                    slug=slug,
                    title=candidate.title,
                    organizer=candidate.organizer,
                    organizer_logo=candidate.organizer_logo,
                    category=candidate.category,
                    mode=candidate.mode,
                    location=candidate.location,
                    short_description=candidate.short_description,
                    full_description=candidate.full_description,
                    direct_registration_url=candidate.direct_registration_url,
                    official_website_url=candidate.official_website_url or candidate.direct_registration_url,
                    prize_or_stipend_amount=candidate.prize_or_stipend_amount,
                    prize_currency=candidate.prize_currency,
                    prize_description=candidate.prize_description,
                    is_free=candidate.is_free,
                    fee_amount=candidate.fee_amount,
                    deadline=candidate.deadline,
                    start_date=candidate.start_date,
                    end_date=candidate.end_date,
                    eligibility_education=candidate.eligibility_education,
                    eligibility_criteria=candidate.eligibility_criteria,
                    skills_required=candidate.skills_required,
                    tags=candidate.tags,
                    verification_status=status,
                    trust_score=trust_score,
                    verification_evidence=evidence,
                    is_duplicate=False,
                    merged_sources_count=1,
                    source_platform=candidate.source_platform,
                    source_url=candidate.source_url,
                    is_active=True,
                    is_featured=(trust_score >= 95)
                )

                db.add(new_opp)
                db.flush()
                existing_opps.append(new_opp)
                stored_count += 1
                details.append({
                    "id": new_opp.id,
                    "title": new_opp.title,
                    "organizer": new_opp.organizer,
                    "category": new_opp.category,
                    "action": "STORED_AS_NEW",
                    "trust_score": trust_score,
                    "status": status
                })

            except Exception as e:
                logger.error(f"Error processing item '{getattr(item, 'title', 'unknown')}': {e}")

        # Update or record SourceHealth
        latency = int((time.time() - start_time) * 1000)
        source_name = getattr(self.search_provider, "__class__", type(self.search_provider)).__name__
        source_record = db.query(SourceHealth).filter(SourceHealth.source_name == source_name).first()

        if not source_record:
            source_record = SourceHealth(
                source_name=source_name,
                connector_type="AI_SEARCH_AGENT",
                target_url="https://orbinex.ai/agent/discovery",
                last_synced_at=datetime.utcnow(),
                status="healthy",
                latency_ms=latency,
                items_discovered=stored_count,
                freshness_score=99
            )
            db.add(source_record)
        else:
            source_record.last_synced_at = datetime.utcnow()
            source_record.latency_ms = latency
            source_record.items_discovered += stored_count
            source_record.status = "healthy"

        db.commit()

        elapsed_seconds = round(time.time() - start_time, 2)
        summary = {
            "status": "success",
            "duration_seconds": elapsed_seconds,
            "total_discovered": total_discovered,
            "stored_new_count": stored_count,
            "merged_count": merged_count,
            "duplicates_flagged": duplicates_flagged,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details
        }
        logger.info(f"Discovery complete: {stored_count} new opportunities stored, {merged_count} merged in {elapsed_seconds}s.")
        return summary

discovery_agent = OpportunityDiscoveryAgent()
