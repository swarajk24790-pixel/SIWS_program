import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from backend.app.core.database import Base

class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    type = Column(String, default="Study Block")  # 'Study Block', 'Assignment', 'Flashcards', 'Exam'
    subject = Column(String, default="")
    date = Column(String, default="")
    day = Column(String, default="")
    priority = Column(String, default="This Week")  # 'Urgent', 'This Week', 'Later'
    completed = Column(Boolean, default=False)
    reason = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
