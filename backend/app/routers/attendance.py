import math
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.attendance import AttendanceSubject, AttendanceLog
from backend.app.schemas.attendance import (
    AttendanceSubjectOut,
    AttendanceSubjectCreate,
    AttendanceLogRequest,
    BulkAttendanceRequest,
    WhatIfRequest,
    WhatIfResponse
)

router = APIRouter(prefix="/attendance", tags=["Attendance Management & What-If Analyzer"])

def compute_status(pct: float, required: int) -> str:
    if pct < required:
        return "critical"
    elif pct < required + 5:
        return "warning"
    return "safe"

@router.get("", response_model=List[AttendanceSubjectOut])
async def list_attendance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AttendanceSubject).where(AttendanceSubject.user_id == current_user.id)
    result = await db.execute(stmt)
    subjects = result.scalars().all()

    # Seed default subjects if empty
    if not subjects:
        defaults = [
            {"name": "Distributed Operating Systems", "code": "CS 301", "attended": 34, "held": 40, "required": 75, "faculty": "Prof. Chen"},
            {"name": "Database Management Systems", "code": "CS 305", "attended": 25, "held": 35, "required": 75, "faculty": "Prof. Miller"},
            {"name": "Artificial Intelligence & Neural Nets", "code": "CS 312", "attended": 36, "held": 38, "required": 75, "faculty": "Dr. Vaswani"},
            {"name": "Computer Networks & Protocols", "code": "CS 318", "attended": 29, "held": 32, "required": 75, "faculty": "Dr. Tanenbaum"},
        ]
        subjects = []
        for d in defaults:
            s = AttendanceSubject(user_id=current_user.id, **d)
            db.add(s)
            subjects.append(s)
        await db.commit()
        for s in subjects:
            await db.refresh(s)

    out = []
    for s in subjects:
        pct = round((s.attended / s.held * 100), 1) if s.held > 0 else 0.0
        out.append(AttendanceSubjectOut(
            id=s.id,
            user_id=s.user_id,
            name=s.name,
            code=s.code,
            attended=s.attended,
            held=s.held,
            required=s.required,
            faculty=s.faculty,
            percentage=pct,
            status=compute_status(pct, s.required)
        ))
    return out

@router.post("", response_model=AttendanceSubjectOut)
async def create_subject(
    payload: AttendanceSubjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    subject = AttendanceSubject(
        user_id=current_user.id,
        name=payload.name,
        code=payload.code,
        attended=payload.attended,
        held=payload.held,
        required=payload.required,
        faculty=payload.faculty or ""
    )
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    
    pct = round((subject.attended / subject.held * 100), 1) if subject.held > 0 else 0.0

    return AttendanceSubjectOut(
        id=subject.id,
        user_id=subject.user_id,
        name=subject.name,
        code=subject.code,
        attended=subject.attended,
        held=subject.held,
        required=subject.required,
        faculty=subject.faculty,
        percentage=pct,
        status=compute_status(pct, subject.required)
    )

@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AttendanceSubject).where(
        AttendanceSubject.id == subject_id,
        AttendanceSubject.user_id == current_user.id
    )
    result = await db.execute(stmt)
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    await db.delete(subject)
    await db.commit()
    return {"message": "Subject deleted successfully", "id": subject_id}

@router.post("/{subject_id}/log", response_model=AttendanceSubjectOut)
async def log_attendance(
    subject_id: str,
    payload: AttendanceLogRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AttendanceSubject).where(
        AttendanceSubject.id == subject_id,
        AttendanceSubject.user_id == current_user.id
    )
    result = await db.execute(stmt)
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    subject.attended += payload.attended_delta
    subject.held += payload.held_delta
    
    # Audit log
    status_label = "present" if payload.attended_delta > 0 else "absent"
    db.add(AttendanceLog(subject_id=subject.id, status=status_label, count=1))
    
    await db.commit()
    await db.refresh(subject)

    pct = round((subject.attended / subject.held * 100), 1) if subject.held > 0 else 0.0

    return AttendanceSubjectOut(
        id=subject.id,
        user_id=subject.user_id,
        name=subject.name,
        code=subject.code,
        attended=subject.attended,
        held=subject.held,
        required=subject.required,
        faculty=subject.faculty,
        percentage=pct,
        status=compute_status(pct, subject.required)
    )

@router.post("/bulk", response_model=AttendanceSubjectOut)
async def mark_bulk_attendance(
    payload: BulkAttendanceRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AttendanceSubject).where(
        AttendanceSubject.id == payload.subject_id,
        AttendanceSubject.user_id == current_user.id
    )
    result = await db.execute(stmt)
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    subject.held += payload.days
    if payload.status == "present":
        subject.attended += payload.days
    
    db.add(AttendanceLog(subject_id=subject.id, status=f"bulk_{payload.status}", count=payload.days))
    await db.commit()
    await db.refresh(subject)

    pct = round((subject.attended / subject.held * 100), 1) if subject.held > 0 else 0.0
    return AttendanceSubjectOut(
        id=subject.id,
        user_id=subject.user_id,
        name=subject.name,
        code=subject.code,
        attended=subject.attended,
        held=subject.held,
        required=subject.required,
        faculty=subject.faculty,
        percentage=pct,
        status=compute_status(pct, subject.required)
    )

@router.post("/calculate-whatif", response_model=WhatIfResponse)
async def calculate_whatif(
    payload: WhatIfRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AttendanceSubject).where(
        AttendanceSubject.id == payload.subject_id,
        AttendanceSubject.user_id == current_user.id
    )
    result = await db.execute(stmt)
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")

    current_pct = (subject.attended / subject.held * 100) if subject.held > 0 else 0.0
    T = payload.target_percentage / 100.0

    if round(current_pct) == payload.target_percentage:
        return WhatIfResponse(
            subject_id=subject.id,
            current_percentage=round(current_pct, 1),
            target_percentage=payload.target_percentage,
            type="exact",
            count=0,
            message=f"You are currently at your exact {payload.target_percentage}% target. Maintain 1-for-1 attendance to stay on track."
        )
    elif current_pct < payload.target_percentage:
        # classes needed: ceil((T*held - attended)/(1 - T))
        needed = math.ceil((T * subject.held - subject.attended) / (1 - T))
        count = max(1, needed)
        return WhatIfResponse(
            subject_id=subject.id,
            current_percentage=round(current_pct, 1),
            target_percentage=payload.target_percentage,
            type="attend",
            count=count,
            message=f"You must attend the next {count} consecutive classes without missing to reach {payload.target_percentage}%."
        )
    else:
        # can miss: floor((attended - T*held)/T)
        can_miss = math.floor((subject.attended - T * subject.held) / T)
        count = max(0, can_miss)
        return WhatIfResponse(
            subject_id=subject.id,
            current_percentage=round(current_pct, 1),
            target_percentage=payload.target_percentage,
            type="bunk",
            count=count,
            message=f"You can safely miss up to {count} classes while remaining at or above {payload.target_percentage}%."
        )
