from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.planner import StudyTask

router = APIRouter(prefix="/planner", tags=["Smart Academic Planner & Timetable"])

@router.get("/tasks")
async def get_study_tasks(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudyTask).where(StudyTask.user_id == current_user.id)
    tasks = (await db.execute(stmt)).scalars().all()

    # Seed default tasks if empty
    if not tasks:
        seed_tasks = [
            {"title": "Distributed Systems: Raft Leader Election State Machine", "type": "Study Block", "subject": "CS 301", "date": "Today, 4:00 PM - 5:30 PM", "day": "Mon", "priority": "Urgent", "reason": "Midterm in 6 days"},
            {"title": "DBMS: B+ Tree Range Queries implementation", "type": "Assignment", "subject": "CS 305", "date": "Tomorrow, 2:00 PM - 4:00 PM", "day": "Tue", "priority": "Urgent", "reason": "Homework 3 due Thursday"},
            {"title": "AI: Review Attention Mechanism & Multi-Head Projections", "type": "Flashcards", "subject": "CS 312", "date": "Wednesday, 6:00 PM - 7:00 PM", "day": "Wed", "priority": "This Week", "reason": "Spaced repetition"},
            {"title": "Computer Networks: TCP Tahoe vs Reno Congestion analysis", "type": "Study Block", "subject": "CS 318", "date": "Thursday, 3:00 PM - 5:00 PM", "day": "Thu", "priority": "This Week", "reason": "Lab evaluation"},
            {"title": "Midterm II: Distributed Operating Systems", "type": "Exam", "subject": "CS 301", "date": "Friday, 10:00 AM - 12:00 PM", "day": "Fri", "priority": "Urgent", "reason": "Official Examination"},
        ]
        tasks = []
        for st in seed_tasks:
            t = StudyTask(user_id=current_user.id, **st)
            db.add(t)
            tasks.append(t)
        await db.commit()
        for t in tasks:
            await db.refresh(t)

    return tasks

@router.post("/tasks/{task_id}/toggle")
async def toggle_task_completed(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(StudyTask).where(StudyTask.id == task_id, StudyTask.user_id == current_user.id)
    task = (await db.execute(stmt)).scalars().first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    
    task.completed = not task.completed
    await db.commit()
    await db.refresh(task)
    return {"id": task.id, "completed": task.completed}
