import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger("orbinex.ai")

class AIAssistantService:
    """
    Provider-independent AI Layer for ORBINEX.
    Leverages Google Gemini 3.5 Flash-Lite LLM with intelligent deterministic engine backup.
    """

    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.gemini_model = "gemini-3.5-flash-lite"
        self.gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.gemini_model}:generateContent"

    def _call_gemini_raw(self, prompt: str) -> Optional[str]:
        """
        Calls Google Gemini 3.5 Flash-Lite REST API directly using httpx.
        """
        if not self.gemini_key:
            return None

        try:
            url = f"{self.gemini_url}?key={self.gemini_key}"
            payload = {
                "contents": [
                    {
                        "parts": [
                            {"text": prompt}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 2048
                }
            }
            with httpx.Client(timeout=15.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "")
                else:
                    logger.warning(f"Gemini API returned status {res.status_code}: {res.text[:200]}")
        except Exception as e:
            logger.warning(f"Gemini API connection error: {e}")
        return None

    def analyze_resume(self, resume_text: str, target_role: str, opportunities: List[Any] = None) -> Dict[str, Any]:
        """
        Analyzes candidate resume for a target role using Gemini LLM with structured output.
        """
        role_skills_map = {
            "Fullstack SDE": ["react", "typescript", "python", "fastapi", "node.js", "docker", "postgresql", "rest api", "git", "data structures"],
            "Frontend Engineer": ["react", "typescript", "javascript", "tailwind", "html", "css", "next.js", "redux", "ui/ux", "web performance"],
            "Backend & Cloud Engineer": ["python", "go", "fastapi", "docker", "kubernetes", "aws", "postgresql", "redis", "microservices", "system design"],
            "AI / ML Engineer": ["python", "pytorch", "tensorflow", "machine learning", "deep learning", "nlp", "transformers", "pandas", "numpy", "llms"],
            "Mobile App Developer": ["react native", "flutter", "typescript", "android", "ios", "swift", "kotlin", "mobile ui", "firebase", "api integration"]
        }

        required_skills = role_skills_map.get(target_role, role_skills_map["Fullstack SDE"])
        resume_lower = resume_text.lower()

        found = [s for s in required_skills if s in resume_lower]
        missing = [s for s in required_skills if s not in resume_lower]

        # Base ATS calculation
        skill_ratio = len(found) / max(1, len(required_skills))
        base_score = int(skill_ratio * 70)
        word_count = len(resume_text.split())
        ats_score = min(98, max(45, int(base_score + (15 if word_count > 100 else 5) + (10 if "%" in resume_text or "$" in resume_text or "₹" in resume_text else 0))))
        combined_score = min(99, max(40, int((ats_score * 0.5) + (base_score * 0.5) + 12)))

        strengths = [
            f"Strong alignment with {len(found)} core competencies for {target_role}",
            "Solid project experience and demonstrated version control usage",
            "Clear technical vocabulary recognized by modern ATS parsers"
        ]

        improvements = []
        if missing:
            improvements.append(f"Add projects highlighting {', '.join([s.title() for s in missing[:3]])}")
        improvements.append("Incorporate quantifiable impact metrics (e.g. 'reduced latency by 35%') in bullet points")

        verdict = (
            f"High Potential Candidate for {target_role} ({combined_score}% match). "
            f"Resume exhibits strong baseline skills in {', '.join([s.title() for s in found[:3]]) if found else 'fundamental software engineering'}. "
            f"Addressing gaps in {missing[0].title() if missing else 'system architecture'} will significantly boost recruiter callbacks."
        )

        # Try enhancing verdict via Gemini if available
        prompt = (
            f"Act as a top tech recruiter and ATS resume specialist. "
            f"Analyze this resume snippet for the role of '{target_role}':\n\n"
            f"{resume_text[:1200]}\n\n"
            f"Provide a 2-sentence actionable verdict evaluating its strength and 1 top recommendation for improvement. "
            f"Be concise, encouraging, and professional."
        )
        gemini_res = self._call_gemini_raw(prompt)
        if gemini_res and len(gemini_res.strip()) > 20:
            verdict = gemini_res.strip()

        # Match relevant opportunities from database
        matched_opps = []
        if opportunities:
            for opp in opportunities[:4]:
                matched_opps.append({
                    "id": opp.id,
                    "title": opp.title,
                    "organizer": opp.organizer,
                    "category": opp.category,
                    "deadline": opp.deadline.isoformat() if hasattr(opp.deadline, "isoformat") else str(opp.deadline),
                    "prize_description": opp.prize_description,
                    "direct_registration_url": opp.direct_registration_url
                })

        return {
            "target_role": target_role,
            "combined_score": combined_score,
            "ats_score": ats_score,
            "found_skills": [s.title() for s in found],
            "missing_skills": [s.title() for s in missing],
            "strengths": strengths,
            "improvements": improvements,
            "summary_verdict": verdict,
            "recommended_opportunities": matched_opps
        }

    def generate_prep_checklist(self, opportunity: Any) -> Dict[str, Any]:
        """
        Creates a tailored stage-by-stage preparation playbook for the opportunity.
        """
        category = opportunity.category.lower()
        title = opportunity.title
        skills = opportunity.skills_required or ["General Tech", "Problem Solving"]

        phases = [
            {
                "phase_name": "Phase 1: Registration & Eligibility Verification (Days 1-3)",
                "actions": [
                    f"Review official eligibility guidelines for {opportunity.organizer}",
                    "Assemble core project team and verify registration deadline",
                    "Fork starter templates and configure GitHub organization"
                ]
            },
            {
                "phase_name": "Phase 2: Architecture & Prototype Building (Days 4-12)",
                "actions": [
                    f"Implement core logic utilizing {skills[0] if skills else 'TypeScript/Python'}",
                    "Ensure responsive UI with clean navigation and zero breaking console errors",
                    "Deploy staging environment on Vercel or cloud provider"
                ]
            },
            {
                "phase_name": "Phase 3: Final Pitch & Submission Verification (Days 13-End)",
                "actions": [
                    "Record 2-minute demo video showcasing real problem-solving impact",
                    "Submit direct link and verify confirmation email receipt",
                    "Add project documentation and architecture diagram to README.md"
                ]
            }
        ]

        # Optional Gemini enhancement for insider tips
        insider_tips = [
            "Judges prioritize a working prototype over an unfinished complex architecture.",
            "Highlight the real-world impact and business viability during the demo.",
            "Ensure your verification badge is maintained by adhering to official submission rules."
        ]

        prompt = (
            f"Provide 3 short, high-value insider tips for a student entering '{title}' organized by '{opportunity.organizer}'. "
            f"Format as 3 concise bullet points under 20 words each."
        )
        gemini_tips = self._call_gemini_raw(prompt)
        if gemini_tips:
            lines = [l.strip().lstrip("-*123. ") for l in gemini_tips.strip().split("\n") if len(l.strip()) > 10]
            if len(lines) >= 3:
                insider_tips = lines[:3]

        return {
            "opportunity_id": opportunity.id,
            "opportunity_title": title,
            "phases": phases,
            "key_deliverables": [
                "Public GitHub Repository with MIT license",
                "Working Hosted Demo Link (Vercel / Cloud)",
                "2-Minute Video Walkthrough",
                "Solution Architecture Slide Deck"
            ],
            "suggested_tech_stack": skills[:5] if skills else ["React", "FastAPI", "TailwindCSS"],
            "insider_tips": insider_tips
        }

    def draft_statement_of_purpose(self, opportunity: Any, user: Any, target_track: Optional[str] = None) -> Dict[str, Any]:
        """
        Drafts a tailored application statement, cover note, and elevator pitch.
        """
        skills_str = ", ".join(user.skills[:4]) if user.skills else "software engineering and product design"
        track_str = target_track or (opportunity.tags[0] if opportunity.tags else "General Track")

        subject = f"Application: {user.full_name} for {opportunity.title} ({opportunity.organizer})"
        
        pitch = (
            f"Passionate {user.education_level} from {user.university} with proven expertise in {skills_str}. "
            f"Applying for {opportunity.title} to develop high-impact solutions in {track_str}."
        )

        cover_letter = f"""Dear {opportunity.organizer} Selection Committee,

I am writing to express my strong enthusiasm for participating in {opportunity.title}. As an aspiring technologist currently pursuing {user.degree} at {user.university} (Class of {user.graduation_year}), my technical background and project experience strongly align with your challenge objectives.

Throughout my academic and open-source journey, I have developed solid competency in {skills_str}. For {opportunity.title}, I am particularly targeting the {track_str} track, where I plan to architect a scalable, user-centric solution that directly addresses the problem statement with genuine innovation and clean code standards.

Key highlights of what I bring to {opportunity.title}:
• Hands-on development experience in {skills_str}
• Strong problem-solving aptitude with a CGPA of {user.cgpa}
• Track record of collaborative delivery, hackathon teamwork, and production deployments

I have reviewed the official criteria and verified all eligibility guidelines through the ORBINEX platform. I would be thrilled to contribute to {opportunity.title} and showcase our solution.

Thank you for your time and consideration.

Warm regards,
{user.full_name}
Portfolio: {user.portfolio_url or 'https://portfolio.dev'}
GitHub: {user.github_url or 'https://github.com'}
LinkedIn: {user.linkedin_url or 'https://linkedin.com'}"""

        # Gemini enhancement for pitch & cover letter if available
        prompt = (
            f"Draft a compelling 2-sentence elevator pitch and a concise 3-paragraph cover letter for student {user.full_name} "
            f"({user.university}, skilled in {skills_str}) applying to '{opportunity.title}' organized by '{opportunity.organizer}'. "
            f"Target track: {track_str}. Keep it professional and enthusiastic."
        )
        gemini_draft = self._call_gemini_raw(prompt)
        if gemini_draft and len(gemini_draft.strip()) > 100:
            cover_letter = gemini_draft.strip()

        return {
            "opportunity_id": opportunity.id,
            "subject_line": subject,
            "cover_letter_body": cover_letter.strip(),
            "pitch_summary": pitch,
            "key_talking_points": [
                f"Direct alignment with {track_str} domain",
                f"Strong proficiency in {skills_str}",
                f"Demonstrated project delivery experience at {user.university}"
            ]
        }

    def draft_partner_outreach(self, partner_name: str, recipient_name: str, recipient_college: str, opp_title: Optional[str] = None) -> Dict[str, Any]:
        """
        Drafts professional outreach to college leads, clubs, and student ambassadors.
        """
        opp_context = f"regarding {opp_title}" if opp_title else "to announce upcoming national opportunities"
        
        subject = f"Partnership Opportunity: Inviting {recipient_college} Students to {opp_title or 'ORBINEX Flagship Challenge'}"
        
        body = f"""Dear {recipient_name},

Greetings from {partner_name}!

We are reaching out to connect with the student community and tech clubs at {recipient_college} {opp_context}.

At {partner_name}, we believe students at {recipient_college} possess exceptional technical talent. Through our partnership with the ORBINEX AI Opportunity Intelligence platform, we are offering verified access, mentorship, and direct fast-track evaluation for your top students.

Key Opportunities for {recipient_college}:
1. Dedicated registration access and waiver of screening rounds for top student teams.
2. Mentorship sessions from industry leaders and engineering directors.
3. Access to cash prizes, incubation grants, and hiring interviews.

We would love to schedule a brief 10-minute briefing with your student leads or department coordinators to share official registration guidelines, promotional material, and campus ambassador roles.

Looking forward to empowering your students together!

Warm regards,
Campus Partnerships Team
{partner_name}
Powered by ORBINEX (https://orbinex.ai)"""

        return {
            "subject": subject,
            "body": body.strip(),
            "key_highlights": [
                f"Personalized to {recipient_college}",
                "Explicit benefits: fast-track evaluation & mentorship",
                "Includes verified platform credentials and clean call to action"
            ]
        }

ai_assistant = AIAssistantService()
