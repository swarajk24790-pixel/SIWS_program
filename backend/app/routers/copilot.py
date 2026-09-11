from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user, get_optional_current_user
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
    generate_quiz,
    generate_career_growth_recommendations,
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


@router.post("/notes/summarize", response_model=NoteSummarizeResponse)
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


@router.post("/notes/flashcards", response_model=FlashcardResponse)
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


# ─── Quiz Generator ───────────────────────────────────────────────────────────

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: list
    correct: int
    explanation: str

class QuizRequest(BaseModel):
    doc_title: str
    subject: str
    count: Optional[int] = 5

class QuizResponse(BaseModel):
    doc_id: str
    questions: list

@router.post("/notes/quiz")
async def generate_notes_quiz(
    payload: QuizRequest,
    current_user: User = Depends(get_current_user),
):
    """AI-generated MCQ quiz from document topic for practice and assessment."""
    questions = await generate_quiz(payload.doc_title, payload.subject, payload.count or 5)
    return {"doc_id": payload.doc_title, "questions": questions}



# ─── Career & Profile Growth AI Advisor ───────────────────────────────────────

class CareerGrowthRequest(BaseModel):
    profile: Optional[dict] = None
    activities: Optional[list] = None

@router.post("/career/suggest")
async def suggest_career_growth(
    payload: CareerGrowthRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Analyze student achievements and suggest internships, capstone projects, and courses."""
    # Use passed profile or current_user
    if payload.profile:
        user_dict = payload.profile
    elif current_user:
        user_dict = {
            "name": current_user.name,
            "email": current_user.email,
            "college": current_user.college,
            "course": current_user.course,
            "semester": current_user.semester,
            "gpa": str(current_user.cgpa or 8.0),
        }
    else:
        user_dict = {"name": "Guest Student", "course": "General"}

    # Fetch activities from DB if not provided
    activities_list = payload.activities
    if activities_list is None and current_user:
        from backend.app.models.activity import ActivityItem
        stmt = select(ActivityItem).where(ActivityItem.user_id == current_user.id)
        acts = (await db.execute(stmt)).scalars().all()
        activities_list = [
            {"id": a.id, "title": a.title, "type": a.type, "subtitle": a.subtitle, "date": a.date}
            for a in acts
        ]
    elif activities_list is None:
        activities_list = []

    result = await generate_career_growth_recommendations(user_dict, activities_list)
    return result
