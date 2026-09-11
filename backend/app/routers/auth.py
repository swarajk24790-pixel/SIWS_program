from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.security import create_access_token, get_password_hash, verify_password
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserLogin, UserOut, UserUpdate, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Profile (SQLite)"])

@router.post("/register", response_model=TokenResponse)
async def register_user(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email)
    existing = (await db.execute(stmt)).scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    hashed_pwd = get_password_hash(payload.password) if payload.password else None
    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hashed_pwd
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": user.id, "email": user.email, "name": user.name})
    return TokenResponse(access_token=token, user=user)

@router.post("/login", response_model=TokenResponse)
async def login_user(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email)
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email credentials.")
    if user.hashed_password and not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid password.")

    token = create_access_token({"sub": user.id, "email": user.email, "name": user.name})
    return TokenResponse(access_token=token, user=user)

@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
async def update_my_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    update_data = payload.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(current_user, field, val)
    
    await db.commit()
    await db.refresh(current_user)
    return current_user
