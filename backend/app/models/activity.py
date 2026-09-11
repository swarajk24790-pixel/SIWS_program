import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, JSON
from backend.app.core.database import Base

class ActivityItem(Base):
    __tablename__ = "activity_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'hackathon', 'course', 'internship', 'project', 'responsibility'
    source = Column(String, default="Manual")  # 'Auto-captured', 'Manual', 'Imported'
    subtitle = Column(String, default="")
    date = Column(String, default="")
    description = Column(Text, default="")
    bullets = Column(JSON, default=list)  # ATS-ready bullet points list
    tags = Column(JSON, default=list)
    certificate_url = Column(String, default="")
    repo_url = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
