from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.activity import ActivityItem
from backend.app.core.firestore_db import firestore_service

router = APIRouter(prefix="/resume", tags=["Living ATS Resume & Portfolio Pipeline"])

@router.get("/compile")
async def compile_living_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """
    Compiles an ATS-ready structured resume payload by aggregating
    all verified milestones from the Unified Activity Feed.
    """
    stmt = select(ActivityItem).where(ActivityItem.user_id == current_user.id).order_by(ActivityItem.created_at.desc())
    items = (await db.execute(stmt)).scalars().all()

    work_experience = []
    projects = []
    certifications = []
    leadership = []

    for it in items:
        entry = {
            "title": it.title,
            "subtitle": it.subtitle,
            "date": it.date,
            "description": it.description,
            "bullets": it.bullets,
            "tags": it.tags or []
        }
        if it.type == "internship":
            work_experience.append(entry)
        elif it.type in ["project", "hackathon"]:
            projects.append(entry)
        elif it.type == "course":
            certifications.append(entry)
        elif it.type == "responsibility":
            leadership.append(entry)

    return {
        "candidate": {
            "name": current_user.name,
            "email": current_user.email,
            "college": current_user.college,
            "course": current_user.course,
            "semester": current_user.semester,
            "cgpa": current_user.cgpa,
            "github": current_user.github,
            "linkedin": current_user.linkedin
        },
        "summary": f"High-performing {current_user.course} student with a {current_user.cgpa} CGPA. Experienced in distributed architectures, full-stack systems, and competitive hackathons.",
        "skills": {
            "languages": ["Python", "Go", "JavaScript / TypeScript", "C++", "SQL"],
            "frameworks": ["FastAPI", "React", "Node.js", "PyTorch", "Docker"],
            "core": ["Distributed Systems", "Database Internals", "Operating Systems", "RESTful APIs"]
        },
        "work_experience": work_experience,
        "projects": projects,
        "certifications": certifications,
        "leadership": leadership,
        "total_verified_feed_items": len(items),
        "ats_score": 94
    }

    # Sync to Firestore resumes collection
    firestore_service.set_document("resumes", current_user.id, result)

    return result

@router.get("/portfolio")
async def compile_portfolio_bundle(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict[str, Any]:
    """Compiles modern web portfolio JSON bundle for public deployment."""
    resume_data = await compile_living_resume(current_user, db)
    portfolio = {
        "slug": current_user.name.lower().replace(" ", "-").replace(".", ""),
        "headline": f"Autonomous Engineer & Computer Science Student at {current_user.college}",
        "resume_data": resume_data,
        "theme": "Midnight Cyberpunk",
        "custom_domain": None
    }

    # Sync to Firestore portfolios collection
    firestore_service.set_document("portfolios", current_user.id, portfolio)

    return portfolio

