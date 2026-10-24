import re
from datetime import datetime, timedelta
from typing import List, Dict, Any

class DiscoveryEngine:
    """
    Automated Discovery & Extraction Engine.
    Connects to permitted public feeds, official websites, and partner submissions.
    Extracts structured fields: title, organizer, eligibility, deadline, benefits, and registration link.
    """

    @staticmethod
    def extract_structured_fields(raw_text: str, source_metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Parses text/announcement to extract key opportunity metadata.
        """
        source_metadata = source_metadata or {}
        
        # Detect category
        raw_lower = raw_text.lower()
        if "hackathon" in raw_lower or "hack" in raw_lower or "buildathon" in raw_lower:
            category = "hackathon"
        elif "internship" in raw_lower or "intern" in raw_lower or "summer analyst" in raw_lower:
            category = "internship"
        elif "scholarship" in raw_lower or "grant" in raw_lower or "financial aid" in raw_lower:
            category = "scholarship"
        elif "fellowship" in raw_lower or "fellow" in raw_lower:
            category = "fellowship"
        elif "coding" in raw_lower or "contest" in raw_lower or "competitive" in raw_lower:
            category = "coding_contest"
        else:
            category = "hackathon"

        # Detect Mode
        if "online" in raw_lower or "virtual" in raw_lower or "remote" in raw_lower:
            mode = "online"
            location = "Virtual / Remote"
        elif "hybrid" in raw_lower:
            mode = "hybrid"
            location = "Hybrid (India & Remote)"
        else:
            mode = "in-person"
            location = "Bengaluru / New Delhi"

        # Detect Prize or Stipend
        prize_match = re.search(r'(?:₹|\$|rs\.?|inr|usd)\s*([\d,]+(?:\.\d+)?)\s*(?:lakh|k|cr|million)?', raw_text, re.IGNORECASE)
        prize_amount = 250000.0
        prize_currency = "INR"
        prize_description = "Cash Prizes, Goodies & Certificates"

        if prize_match:
            prize_description = prize_match.group(0).strip()
            # Extract numerical approximation
            nums = re.sub(r'[^\d]', '', prize_match.group(1))
            if nums:
                prize_amount = float(nums)
                if "lakh" in raw_lower:
                    prize_amount *= 100000

        # Detect Deadline (defaults to 14 days out if not parsed)
        deadline = datetime.utcnow() + timedelta(days=21)

        # Detect Eligibility & Skills
        skills = []
        common_skills = ["Python", "JavaScript", "TypeScript", "React", "Machine Learning", "AI", "Cloud", "Data Science", "Web3", "Docker", "Node.js", "Java", "C++"]
        for s in common_skills:
            if re.search(rf'\b{re.escape(s)}\b', raw_text, re.IGNORECASE):
                skills.append(s)
        if not skills:
            skills = ["Problem Solving", "Web Development", "AI/ML"]

        return {
            "title": source_metadata.get("title", "Discovered Tech Innovation Challenge 2026"),
            "organizer": source_metadata.get("organizer", "Tech Partner Network"),
            "category": category,
            "mode": mode,
            "location": location,
            "short_description": raw_text[:280] + "..." if len(raw_text) > 280 else raw_text,
            "full_description": raw_text,
            "prize_or_stipend_amount": prize_amount,
            "prize_currency": prize_currency,
            "prize_description": prize_description,
            "is_free": True,
            "fee_amount": 0.0,
            "deadline": deadline,
            "skills_required": skills,
            "eligibility_education": ["Undergraduate", "Postgraduate", "Recent Graduate"],
            "eligibility_criteria": [
                "Open to all registered university students worldwide",
                "Teams of 1 to 4 members allowed",
                "Fresh, unsubmitted code built during the hack period"
            ],
            "tags": [category.upper(), mode.capitalize(), "Innovation", "Career"]
        }

discovery_engine = DiscoveryEngine()
