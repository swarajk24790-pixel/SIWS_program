from typing import Optional
from fastapi import Depends, HTTPException, Header
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
    Return the current demo or authenticated SQLite-backed user.
    If a Bearer token is supplied, validate it and load the account by user id.
    If no Bearer token is supplied, fall back to seeding the local demo student.
    """
    email = "swaraj@siws.edu"
    name = "Swaraj K."

    # No token: return or seed the demo user for local development.
    if not authorization or not authorization.startswith("Bearer "):
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        user = result.scalars().first()

        if not user:
            user = User(
                email=email,
                name=name,
                college="SIWS College of Science & Technology",
                course="Computer Science & Engineering",
                semester="Semester 5",
                cgpa=8.0,
                target_attendance=75.0,
                github="",
                linkedin=""
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        return user

    token = authorization.removeprefix("Bearer ").strip()
    payload = await verify_token_payload(token)
    user_id = payload.get("sub") if payload else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Your session is invalid or has expired. Please log in again.")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=401, detail="This account no longer exists.")

    return user
