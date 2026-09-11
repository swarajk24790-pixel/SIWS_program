import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from backend.app.core.database import Base

class AttendanceSubject(Base):
    __tablename__ = "attendance_subjects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    attended = Column(Integer, default=0)
    held = Column(Integer, default=0)
    required = Column(Integer, default=75)
    faculty = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    subject_id = Column(String, ForeignKey("attendance_subjects.id"), nullable=False)
    status = Column(String, nullable=False)  # 'present', 'absent', 'bulk_present', 'bulk_absent'
    count = Column(Integer, default=1)
    timestamp = Column(DateTime, default=datetime.utcnow)
