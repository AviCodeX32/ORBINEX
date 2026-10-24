import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger("orbinex.ai")

class AIAssistantService:
    """
    Provider-independent AI Layer for ORBINEX.
    Supports Google Gemini, OpenAI, or Intelligent Deterministic Engine fallback.
    """

    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    def generate_prep_checklist(self, opportunity: Any) -> Dict[str, Any]:
        """
        Creates a tailored stage-by-stage preparation playbook for the opportunity.
        """
        category = opportunity.category.lower()
        title = opportunity.title
        skills = opportunity.skills_required or ["General Tech", "Problem Solving"]

        phases = [
            {
                "phase_name": "Phase 1: Registration & Team Assembly (Days 1-3)",
                "actions": [
                    f"Review official guidelines for {title} on verified portal",
                    "Assemble complementary team roles (Frontend, Backend/AI, Pitch Lead)",
                    "Finalize team discord/slack channel and project board"
                ]
            },
            {
                "phase_name": "Phase 2: Problem Selection & Ideation (Days 4-7)",
                "actions": [
                    "Evaluate official track problem statements & judge criteria",
                    f"Identify core pain points leveraging {skills[0] if skills else 'modern tech'}",
                    "Draft 1-page solution architecture diagram & user flow"
                ]
            },
            {
                "phase_name": "Phase 3: Prototype & MVP Sprint (Days 8-14)",
                "actions": [
                    f"Implement core functionality using {', '.join(skills[:3])}",
                    "Set up GitHub repository with clean README and deployment link",
                    "Conduct end-to-end user testing & edge case handling"
                ]
            },
            {
                "phase_name": "Phase 4: Submission & Pitch Video (Final 48 Hours)",
                "actions": [
                    "Record 2-3 minute crisp demo video showing working prototype",
                    "Double-check all submission fields and public repository permissions",
                    "Submit before the countdown timer hits 2 hours to avoid server traffic"
                ]
            }
        ]

        if category == "internship":
            phases = [
                {
                    "phase_name": "Phase 1: Resume & ATS Optimization",
                    "actions": [
                        f"Align resume keywords with role requirements: {', '.join(skills[:4])}",
                        "Highlight quantifiable metrics in previous college/open-source projects",
                        "Ensure GitHub profile and live project links are active"
                    ]
                },
                {
                    "phase_name": "Phase 2: Technical Preparation & LeetCode/DSA",
                    "actions": [
                        "Review core Data Structures & Algorithms (Trees, Graphs, DP)",
                        f"Brush up on foundational concepts for {skills[0] if skills else 'System Design'}",
                        "Practice 3 mock timed interview sessions"
                    ]
                },
                {
                    "phase_name": "Phase 3: Behavioral & Role Fit",
                    "actions": [
                        "Prepare STAR method answers for standard situational questions",
                        f"Research {opportunity.organizer}'s engineering culture and recent projects",
                        "Prepare 3 insightful questions for the interviewer"
                    ]
                }
            ]

        return {
            "opportunity_id": opportunity.id,
            "opportunity_title": title,
            "phases": phases,
            "key_deliverables": [
                "Public GitHub Repository with MIT license",
                "Working Hosted Demo Link (Vercel / AWS)",
                "2-Minute Video Walkthrough",
                "Solution Architecture Slide Deck"
            ],
            "suggested_tech_stack": skills[:5] if skills else ["React", "FastAPI", "TailwindCSS"],
            "insider_tips": [
                "Judges prioritize a working prototype over an unfinished complex architecture.",
                "Highlight the real-world impact and business viability during the demo.",
                "Ensure your verification badge is maintained by adhering to official submission rules."
            ]
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
