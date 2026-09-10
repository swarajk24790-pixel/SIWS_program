import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean
from backend.app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    college = Column(String, default="SIWS College of Science & Technology")
    course = Column(String, default="B.Tech Computer Science & Engineering")
    semester = Column(String, default="Semester 5")
    cgpa = Column(Float, default=8.84)
    target_attendance = Column(Float, default=75.0)
    avatar = Column(String, default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
    github = Column(String, default="")
    linkedin = Column(String, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
