from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.security import verify_token_payload
from backend.app.models.user import User

async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Returns current authenticated student.
    Dual-mode support:
    - If Bearer token is provided, verifies JWT / Firebase ID token.
    - If no Bearer token is provided (dev/demo mode), loads or seeds the default demo student.
    """
    email = "swaraj@siws.edu"
    name = "Swaraj K."

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = await verify_token_payload(token)
        if payload and "email" in payload and payload["email"]:
            email = payload["email"]
            name = payload.get("name", name)

    # Fetch user by email
    stmt = select(User).where(User.email == email)
    result = await db.execute(stmt)
    user = result.scalars().first()

    # Auto-provision user if does not exist yet
    if not user:
        clean_name = name
        if clean_name == "Swaraj K." and email != "swaraj@siws.edu":
            # Derive readable name from email e.g. alex.miller@college.edu -> Alex Miller
            user_part = email.split("@")[0].replace(".", " ").replace("_", " ").title()
            clean_name = user_part or "Student User"

        user = User(
            email=email,
            name=clean_name,
            college="University Campus" if email != "swaraj@siws.edu" else "SIWS College of Science & Technology",
            course="Computer Science & Engineering",
            semester="Semester 1" if email != "swaraj@siws.edu" else "Semester 5",
            cgpa=8.0,
            target_attendance=75.0,
            github="",
            linkedin=""
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user
