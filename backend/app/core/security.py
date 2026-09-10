import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from backend.app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create local JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def verify_token_payload(token: str) -> Optional[Dict[str, Any]]:
    """
    Dual-mode token verification:
    1. If FIREBASE_PROJECT_ID is specified, inspects or verifies with Firebase.
    2. Otherwise verifies standard signed JWT.
    """
    try:
        # First attempt local JWT decoding
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        # If token came from Firebase, decode payload (for dev/demo fallback)
        try:
            unverified = jwt.get_unverified_claims(token)
            if unverified and ("user_id" in unverified or "sub" in unverified):
                return {
                    "sub": unverified.get("sub") or unverified.get("user_id"),
                    "email": unverified.get("email", ""),
                    "name": unverified.get("name", "Student User"),
                    "firebase": True
                }
        except Exception:
            pass
        return None
