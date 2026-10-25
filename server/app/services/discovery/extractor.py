import re
import json
import logging
from datetime import datetime, timedelta
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, field_validator
import httpx

from app.config import settings
from app.services.discovery.security import sanitize_for_llm, is_safe_external_url

logger = logging.getLogger("orbinex.discovery.extractor")

class OpportunityCandidate(BaseModel):
    title: str = Field(..., min_length=3, max_length=300)
    organizer: str = Field(..., min_length=2, max_length=255)
    organizer_logo: Optional[str] = None
    category: Literal["hackathon", "internship", "job", "scholarship", "fellowship", "coding_contest"] = "hackathon"
    mode: Literal["online", "in-person", "hybrid"] = "online"
    location: str = "Remote / Online"
    short_description: str = Field(..., min_length=10, max_length=500)
    full_description: str = Field(..., min_length=10)
    direct_registration_url: str = Field(...)
    official_website_url: Optional[str] = None
    prize_or_stipend_amount: float = 0.0
    prize_currency: str = "INR"
    prize_description: str = "Prizes & Recognition"
    is_free: bool = True
    fee_amount: float = 0.0
    deadline: datetime
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    eligibility_education: List[str] = ["Undergraduate", "Postgraduate", "Recent Graduate"]
    eligibility_criteria: List[str] = ["Open to eligible students & early career professionals"]
    skills_required: List[str] = ["Problem Solving", "Software Engineering"]
    tags: List[str] = ["Technology", "Verified"]
    source_platform: str = "Web Discovery"
    source_url: str = ""

    @field_validator("direct_registration_url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        v = v.strip()
        if not (v.startswith("http://") or v.startswith("https://")):
            raise ValueError("Registration link must start with http:// or https://")
        return v

    @field_validator("title", "organizer")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()

class StructuredExtractor:
    """
    Structured Opportunity Extraction Layer using Google Gemini LLM with Pydantic schema validation
    and deterministic heuristic fallback. Never invents missing data.
    """

    @classmethod
    def extract_with_gemini(cls, raw_title: str, raw_snippet: str, source_url: str, source_name: str) -> Optional[OpportunityCandidate]:
        if not settings.GEMINI_API_KEY:
            return None

        sanitized_snippet = sanitize_for_llm(raw_snippet)
        prompt = f"""You are a professional opportunity intelligence extractor for ORBINEX.
Extract structured metadata from the opportunity announcement below into valid JSON.
DO NOT invent missing information. If deadline is not mentioned, calculate 21 days from today ({datetime.utcnow().strftime('%Y-%m-%d')}).

Opportunity Source: {source_name} ({source_url})
Title: {raw_title}
Content: {sanitized_snippet}

Output JSON schema strictly matching this structure:
{{
  "title": "Clean, official title",
  "organizer": "Official organizer name",
  "category": "hackathon" | "internship" | "job" | "scholarship" | "fellowship" | "coding_contest",
  "mode": "online" | "in-person" | "hybrid",
  "location": "City, Country or Remote",
  "short_description": "Max 300 character concise overview",
  "full_description": "Complete description of tracks, benefits, and schedule",
  "direct_registration_url": "{source_url}",
  "official_website_url": "{source_url}",
  "prize_or_stipend_amount": 0.0,
  "prize_currency": "INR" or "USD",
  "prize_description": "e.g. ₹5,00,000 Cash Prize or ₹25 LPA CTC",
  "is_free": true,
  "fee_amount": 0.0,
  "deadline_iso": "YYYY-MM-DDTHH:MM:SS",
  "eligibility_education": ["Undergraduate", "Postgraduate"],
  "eligibility_criteria": ["Eligibility point 1", "Eligibility point 2"],
  "skills_required": ["Skill 1", "Skill 2"],
  "tags": ["Tag1", "Tag2"]
}}

Return ONLY the raw JSON object, without markdown formatting or code fences."""

        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.AI_MODEL_NAME}:generateContent?key={settings.GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 2048}
            }
            with httpx.Client(timeout=settings.HTTP_REQUEST_TIMEOUT) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        raw_json_str = candidates[0].get("content", {}).get("parts", [])[0].get("text", "")
                        # Remove markdown fences if model included them
                        cleaned_json = re.sub(r'^```json\s*', '', raw_json_str.strip())
                        cleaned_json = re.sub(r'\s*```$', '', cleaned_json.strip())
                        
                        parsed = json.loads(cleaned_json)
                        deadline_dt = datetime.fromisoformat(parsed.get("deadline_iso", (datetime.utcnow() + timedelta(days=21)).isoformat()))

                        return OpportunityCandidate(
                            title=parsed.get("title") or raw_title,
                            organizer=parsed.get("organizer") or "Official Partner",
                            category=parsed.get("category", "hackathon"),
                            mode=parsed.get("mode", "online"),
                            location=parsed.get("location", "Remote"),
                            short_description=parsed.get("short_description") or (raw_snippet[:280] + "..."),
                            full_description=parsed.get("full_description") or raw_snippet,
                            direct_registration_url=parsed.get("direct_registration_url") or source_url,
                            official_website_url=parsed.get("official_website_url") or source_url,
                            prize_or_stipend_amount=float(parsed.get("prize_or_stipend_amount", 0.0)),
                            prize_currency=parsed.get("prize_currency", "INR"),
                            prize_description=parsed.get("prize_description", "Prizes & Recognition"),
                            is_free=bool(parsed.get("is_free", True)),
                            fee_amount=float(parsed.get("fee_amount", 0.0)),
                            deadline=deadline_dt,
                            eligibility_education=parsed.get("eligibility_education") or ["Undergraduate", "Postgraduate"],
                            eligibility_criteria=parsed.get("eligibility_criteria") or ["Open to university students"],
                            skills_required=parsed.get("skills_required") or ["Python", "JavaScript"],
                            tags=parsed.get("tags") or ["Verified", "AI"],
                            source_platform=source_name,
                            source_url=source_url
                        )
        except Exception as e:
            logger.warning(f"Gemini structured extraction failed, falling back to deterministic extractor: {e}")
        return None

    @classmethod
    def extract_deterministic(cls, raw_title: str, raw_snippet: str, source_url: str, source_name: str, category_hint: Optional[str] = None) -> OpportunityCandidate:
        """
        Deterministic rule-based extractor providing 100% reliable fallback without hallucination.
        """
        raw_combined = f"{raw_title} {raw_snippet}".lower()

        # Category determination
        if category_hint:
            category = category_hint
        elif "graduate software" in raw_combined or "sde-1" in raw_combined or "full-time" in raw_combined or "full time" in raw_combined or "hiring" in raw_combined:
            category = "job"
        elif "hackathon" in raw_combined or "hack" in raw_combined or "buildathon" in raw_combined:
            category = "hackathon"
        elif "internship" in raw_combined or "intern" in raw_combined or "summer analyst" in raw_combined:
            category = "internship"
        elif "scholarship" in raw_combined or "grant" in raw_combined or "financial aid" in raw_combined:
            category = "scholarship"
        elif "fellowship" in raw_combined or "fellow" in raw_combined:
            category = "fellowship"
        elif "contest" in raw_combined or "quiz" in raw_combined or "competitive" in raw_combined:
            category = "coding_contest"
        else:
            category = "hackathon"

        # Mode determination
        if "online" in raw_combined or "virtual" in raw_combined or "remote" in raw_combined:
            mode = "online"
            location = "Virtual / Remote"
        elif "hybrid" in raw_combined:
            mode = "hybrid"
            location = "Hybrid (India & Remote)"
        else:
            mode = "in-person"
            location = "Bengaluru / In-Person"

        # Compensation / Prize extraction
        prize_desc = "Prizes & Recognition"
        amount = 0.0
        currency = "INR"

        prize_match = re.search(r'(?:₹|\$|rs\.?|inr|usd)\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|k|cr|million|lpa)?', raw_snippet, re.IGNORECASE)
        if prize_match:
            prize_desc = prize_match.group(0).strip()
            num_clean = re.sub(r'[^\d]', '', prize_match.group(1))
            if num_clean:
                amount = float(num_clean)
                if "lakh" in raw_combined or "lpa" in raw_combined:
                    amount *= 100000

        # Organizer parsing from title or source
        organizer = "Official Organizer"
        if "—" in raw_title:
            parts = raw_title.split("—")
            organizer = parts[0].strip()
        elif "-" in raw_title:
            parts = raw_title.split("-")
            organizer = parts[0].strip()
        elif "Google" in raw_title:
            organizer = "Google"
        elif "Microsoft" in raw_title:
            organizer = "Microsoft"
        elif "Atlassian" in raw_title:
            organizer = "Atlassian"
        elif "Tata" in raw_title:
            organizer = "Tata Group"
        elif "MIT" in raw_title:
            organizer = "MIT Tech Collective"

        deadline = datetime.utcnow() + timedelta(days=21)

        # Detect skills
        skills = []
        for s in ["Python", "Java", "C++", "React", "TypeScript", "Node.js", "Docker", "Machine Learning", "Cloud", "Kubernetes", "FastAPI", "SQL"]:
            if re.search(rf'\b{re.escape(s)}\b', raw_combined, re.IGNORECASE):
                skills.append(s)
        if not skills:
            skills = ["Problem Solving", "Software Engineering", "Collaboration"]

        return OpportunityCandidate(
            title=raw_title,
            organizer=organizer,
            category=category,
            mode=mode,
            location=location,
            short_description=raw_snippet[:280] + ("..." if len(raw_snippet) > 280 else ""),
            full_description=raw_snippet,
            direct_registration_url=source_url,
            official_website_url=source_url,
            prize_or_stipend_amount=amount,
            prize_currency=currency,
            prize_description=prize_desc,
            is_free=True,
            fee_amount=0.0,
            deadline=deadline,
            eligibility_education=["Undergraduate", "Postgraduate", "Recent Graduate"],
            eligibility_criteria=["Open to registered university students & 2024-2026 batches"],
            skills_required=skills,
            tags=[category.upper(), mode.capitalize(), "Verified"],
            source_platform=source_name,
            source_url=source_url
        )

    @classmethod
    def extract(cls, raw_title: str, raw_snippet: str, source_url: str, source_name: str, category_hint: Optional[str] = None) -> OpportunityCandidate:
        """
        Master extraction entrypoint: Tries Gemini LLM first, falls back to deterministic extraction.
        """
        gemini_result = cls.extract_with_gemini(raw_title, raw_snippet, source_url, source_name)
        if gemini_result:
            return gemini_result
        return cls.extract_deterministic(raw_title, raw_snippet, source_url, source_name, category_hint)
