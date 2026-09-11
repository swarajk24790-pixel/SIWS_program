import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON
from backend.app.core.database import Base

class NoteDocument(Base):
    __tablename__ = "note_documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    subject = Column(String, default="")
    file_size = Column(String, default="")
    pages = Column(Integer, default=1)
    status = Column(String, default="Ready")  # 'Processing', 'Ready', 'Failed'
    summary = Column(Text, default="")
    key_formulas = Column(JSON, default=list)
    flashcards = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
