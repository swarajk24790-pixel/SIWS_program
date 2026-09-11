from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = "academic_general"  # 'bunk_inquiry', 'notes_solver', etc.
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    source: Optional[str] = "UniPilot Autonomous Copilot"

class NoteSummarizeResponse(BaseModel):
    doc_id: str
    title: str
    summary: str
    key_takeaways: List[str]
    formulas: List[str]

class FlashcardItem(BaseModel):
    id: int
    front: str
    back: str

class FlashcardResponse(BaseModel):
    doc_id: str
    flashcards: List[FlashcardItem]
