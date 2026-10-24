from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User

def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    Returns the active user for the session.
    Defaults to the seeded student user (id=1) or creates one if empty.
    """
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(
            id=1,
            email="student@orbinex.ai",
            full_name="Aarav Sharma",
            role="student",
            education_level="Undergraduate",
            university="IIT Delhi / National Tech Institute",
            degree="B.Tech in Computer Science & Engineering",
            graduation_year=2026,
            cgpa=9.1,
            skills=["Python", "FastAPI", "React", "TypeScript", "Machine Learning", "PyTorch", "Docker"],
            interests=["AI/ML", "Web Development", "Hackathons", "Open Source", "FinTech"],
            target_types=["hackathon", "internship", "fellowship", "scholarship"],
            location_preference="Hybrid / Remote",
            github_url="https://github.com/aarav-sharma-dev",
            linkedin_url="https://linkedin.com/in/aarav-sharma-orbinex",
            portfolio_url="https://aaravsharma.dev"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
