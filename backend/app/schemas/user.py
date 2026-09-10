from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    name: str
    email: EmailStr
    college: Optional[str] = "SIWS College of Science & Technology"
    course: Optional[str] = "B.Tech Computer Science & Engineering"
    semester: Optional[str] = "Semester 5"
    cgpa: Optional[float] = 8.84
    target_attendance: Optional[float] = 75.0
    avatar: Optional[str] = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    github: Optional[str] = ""
    linkedin: Optional[str] = ""

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[str] = None
    cgpa: Optional[float] = None
    target_attendance: Optional[float] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None

class UserOut(UserBase):
    id: str
    is_active: bool

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
