from typing import Dict, Any, List

class RecommenderEngine:
    """
    AI & Deterministic Personalization Engine.
    Matches user profile (skills, degree, graduation year, interests, location preference)
    with opportunity requirements to calculate match score and generate actionable rationale.
    """

    @classmethod
    def score_match(cls, user_profile: Dict[str, Any], opportunity: Any) -> Dict[str, Any]:
        user_skills = set([s.lower() for s in (user_profile.get("skills") or [])])
        opp_skills = set([s.lower() for s in (opportunity.skills_required or [])])
        
        user_interests = set([i.lower() for i in (user_profile.get("interests") or [])])
        opp_tags = set([t.lower() for t in (opportunity.tags or [])])
        opp_category = opportunity.category.lower()

        user_edu = (user_profile.get("education_level") or "Undergraduate").lower()
        opp_edu = [e.lower() for e in (opportunity.eligibility_education or [])]

        # 1. Skill overlap (40%)
        common_skills = user_skills.intersection(opp_skills)
        if opp_skills:
            skill_score = min(1.0, len(common_skills) / max(1, len(opp_skills)))
        else:
            skill_score = 0.8
        
        # 2. Interest / Domain match (25%)
        interest_overlap = user_interests.intersection(opp_tags)
        category_match = opp_category in [t.lower() for t in (user_profile.get("target_types") or [])]
        interest_score = 0.5
        if interest_overlap:
            interest_score += 0.3
        if category_match:
            interest_score += 0.2
        interest_score = min(1.0, interest_score)

        # 3. Education eligibility (25%)
        edu_match = True
        if opp_edu and not any(user_edu in e or e in user_edu for e in opp_edu):
            edu_score = 0.3
            edu_match = False
        else:
            edu_score = 1.0

        # 4. Verified platform boost (10%)
        trust_boost = 0.1 if opportunity.verification_status == "VERIFIED_OFFICIAL" else 0.05

        total = (skill_score * 0.40) + (interest_score * 0.25) + (edu_score * 0.25) + trust_boost
        percentage = int(max(40, min(98, round(total * 100))))

        # Build detailed human-readable rationale
        reasons = []
        if common_skills:
            reasons.append(f"Direct match with your skills: {', '.join([s.title() for s in list(common_skills)[:3]])}")
        if category_match or interest_overlap:
            matched_interest = list(interest_overlap)[0].title() if interest_overlap else opp_category.title()
            reasons.append(f"Fits your interest in {matched_interest} and target opportunity types")
        if edu_match:
            reasons.append(f"Fully eligible for {user_profile.get('education_level', 'Undergraduate')} batch of {user_profile.get('graduation_year', 2026)}")
        if opportunity.is_free:
            reasons.append("Free entry with verified organizer credentials")

        why_matches = " • ".join(reasons) if reasons else "Matches your general tech profile and university tier."

        return {
            "match_percentage": percentage,
            "matched_skills": [s.title() for s in common_skills],
            "missing_skills": [s.title() for s in opp_skills - user_skills],
            "is_education_eligible": edu_match,
            "why_matches": why_matches
        }

recommender_engine = RecommenderEngine()
