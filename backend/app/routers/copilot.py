from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.attendance import AttendanceSubject
from backend.app.schemas.copilot import (
    ChatRequest,
    ChatResponse,
    NoteSummarizeResponse,
    FlashcardResponse,
    FlashcardItem,
)
from backend.app.services.ai_service import (
    academic_chat,
    summarize_notes,
    generate_flashcards,
    regenerate_bullet,
)

router = APIRouter(prefix="/copilot", tags=["AI Copilot & Academic Solver"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Real AI copilot — powered by Google Gemini 2.0 Flash (free) via OpenRouter."""
    # Fetch live attendance for contextual reasoning
    stmt = select(AttendanceSubject).where(AttendanceSubject.user_id == current_user.id)
    subs = (await db.execute(stmt)).scalars().all()
    attendance_ctx = [
        {"name": s.name, "code": s.code, "attended": s.attended,
         "held": s.held, "required": s.required}
        for s in subs
    ]

    # Convert history to OpenRouter message format
    history = [{"role": m.role, "content": m.content} for m in (payload.history or [])]

    result = await academic_chat(payload.message, attendance_ctx, history=history)
    return ChatResponse(**result)


# ─── Notes Summarizer ─────────────────────────────────────────────────────────

class NoteSummarizeRequest(BaseModel):
    doc_title: str
    subject: str


@router.post("/copilot/notes/summarize", response_model=NoteSummarizeResponse)
async def summarize_notes_doc(
    payload: NoteSummarizeRequest,
    current_user: User = Depends(get_current_user),
) -> NoteSummarizeResponse:
    """AI-powered note summarizer — generates structured summary from doc title & subject."""
    data = await summarize_notes(payload.doc_title, payload.subject)
    return NoteSummarizeResponse(
        doc_id=payload.doc_title,
        title=payload.doc_title,
        summary=data.get("summary", ""),
        key_takeaways=data.get("key_takeaways", []),
        formulas=data.get("formulas", []),
    )


# ─── Flashcard Generator ──────────────────────────────────────────────────────

class FlashcardRequest(BaseModel):
    doc_title: str
    subject: str
    count: Optional[int] = 5


@router.post("/copilot/notes/flashcards", response_model=FlashcardResponse)
async def get_doc_flashcards(
    payload: FlashcardRequest,
    current_user: User = Depends(get_current_user),
) -> FlashcardResponse:
    """AI-powered flashcard generator — creates exam-ready Q&A cards from a topic."""
    cards = await generate_flashcards(payload.doc_title, payload.subject, payload.count or 5)
    return FlashcardResponse(
        doc_id=payload.doc_title,
        flashcards=[FlashcardItem(**c) for c in cards],
    )


# ─── Resume Bullet Regenerator ────────────────────────────────────────────────

class BulletRegenRequest(BaseModel):
    bullet: str
    context: Optional[str] = ""


class BulletRegenResponse(BaseModel):
    rewritten: str


@router.post("/regenerate-bullet", response_model=BulletRegenResponse)
async def rewrite_resume_bullet(
    payload: BulletRegenRequest,
    current_user: User = Depends(get_current_user),
):
    """AI rewrite of a single resume bullet point for maximum ATS impact."""
    result = await regenerate_bullet(payload.bullet, payload.context)
    return BulletRegenResponse(rewritten=result)
