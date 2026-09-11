from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.attendance import AttendanceSubject, AttendanceLog
from backend.app.models.activity import ActivityItem

router = APIRouter(prefix='/admin', tags=['Admin Panel'])

ADMIN_SECRET = 'unipilot-admin-2024'

class AdminStudentOut(BaseModel):
    id: str
    name: str
    email: str
    college: str
    course: str
    semester: str
    cgpa: Optional[float] = None
    github: Optional[str] = ''
    linkedin: Optional[str] = ''
    is_active: bool
    subject_count: int = 0
    avg_attendance: Optional[float] = None

class AdminLoginRequest(BaseModel):
    secret: Optional[str] = ''

class AdminLoginResponse(BaseModel):
    token: str
    message: str

@router.post('/login')
async def admin_login(payload: Optional[AdminLoginRequest] = None):
    # Direct admin access without required secret
    return AdminLoginResponse(token=f'admin-{ADMIN_SECRET}', message='Admin access granted')

@router.get('/students', response_model=List[AdminStudentOut])
async def list_all_students(
    admin_token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).order_by(User.created_at.desc())
    users = (await db.execute(stmt)).scalars().all()
    
    # If no students in DB, auto-seed demo students so admin panel is never empty
    if not users:
        seed_students = [
            {
                "email": "aarav.sharma@campus.edu",
                "name": "Aarav Sharma",
                "college": "Apex Institute of Technology",
                "course": "Computer Science & Engineering",
                "semester": "Semester 6",
                "cgpa": 8.75,
                "github": "https://github.com/aaravsharma",
                "linkedin": "https://linkedin.com/in/aaravsharma",
                "subjects": [
                    {"name": "Distributed Operating Systems", "code": "CS 301", "attended": 34, "held": 40, "required": 75, "faculty": "Prof. Chen"},
                    {"name": "Database Management Systems", "code": "CS 305", "attended": 24, "held": 35, "required": 75, "faculty": "Prof. Miller"},
                    {"name": "Artificial Intelligence & Neural Nets", "code": "CS 312", "attended": 36, "held": 38, "required": 75, "faculty": "Dr. Vaswani"},
                    {"name": "Computer Networks & Protocols", "code": "CS 318", "attended": 28, "held": 32, "required": 75, "faculty": "Dr. Tanenbaum"},
                ]
            },
            {
                "email": "priya.patel@campus.edu",
                "name": "Priya Patel",
                "college": "National Institute of Science",
                "course": "Artificial Intelligence & Data Science",
                "semester": "Semester 4",
                "cgpa": 9.20,
                "github": "https://github.com/priyapatel-ai",
                "linkedin": "https://linkedin.com/in/priyapatel",
                "subjects": [
                    {"name": "Machine Learning Foundations", "code": "AI 201", "attended": 38, "held": 40, "required": 75, "faculty": "Dr. Lecun"},
                    {"name": "Big Data Engineering", "code": "DS 205", "attended": 31, "held": 35, "required": 75, "faculty": "Prof. Dean"},
                    {"name": "Deep Learning Architectures", "code": "AI 210", "attended": 29, "held": 36, "required": 75, "faculty": "Dr. Goodfellow"},
                    {"name": "Cloud Computing & MLOps", "code": "CS 220", "attended": 33, "held": 35, "required": 75, "faculty": "Prof. Zaharia"},
                ]
            },
            {
                "email": "rohan.mehta@campus.edu",
                "name": "Rohan Mehta",
                "college": "Metropolitan University",
                "course": "Information Technology",
                "semester": "Semester 5",
                "cgpa": 7.40,
                "github": "https://github.com/rohanm-dev",
                "linkedin": "https://linkedin.com/in/rohanmehta",
                "subjects": [
                    {"name": "Web Architecture & Microservices", "code": "IT 301", "attended": 22, "held": 34, "required": 75, "faculty": "Prof. Fowler"},
                    {"name": "Cybersecurity & Cryptography", "code": "IT 305", "attended": 25, "held": 36, "required": 75, "faculty": "Dr. Schneier"},
                    {"name": "Full Stack Cloud Systems", "code": "IT 312", "attended": 18, "held": 32, "required": 75, "faculty": "Prof. Torvalds"},
                ]
            }
        ]
        for sdata in seed_students:
            subs = sdata.pop("subjects")
            new_u = User(**sdata)
            db.add(new_u)
            await db.flush()
            for sub in subs:
                db.add(AttendanceSubject(user_id=new_u.id, **sub))
        await db.commit()
        users = (await db.execute(stmt)).scalars().all()
    
    result = []
    for u in users:
        att_stmt = select(AttendanceSubject).where(AttendanceSubject.user_id == u.id)
        subjects = (await db.execute(att_stmt)).scalars().all()
        
        subject_count = len(subjects)
        avg_attendance = None
        if subjects:
            percentages = [(s.attended / s.held * 100) if s.held > 0 else 0 for s in subjects]
            avg_attendance = round(sum(percentages) / len(percentages), 1)
        
        result.append(AdminStudentOut(
            id=u.id,
            name=u.name,
            email=u.email,
            college=u.college or 'Not set',
            course=u.course or 'Not set',
            semester=u.semester or 'Not set',
            cgpa=u.cgpa,
            github=u.github or '',
            linkedin=u.linkedin or '',
            is_active=u.is_active,
            subject_count=subject_count,
            avg_attendance=avg_attendance
        ))
    
    return result

@router.get('/students/{student_id}')
async def get_student_detail(
    student_id: str,
    admin_token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == student_id)
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail='Student not found.')
    
    att_stmt = select(AttendanceSubject).where(AttendanceSubject.user_id == user.id)
    subjects = (await db.execute(att_stmt)).scalars().all()

    # Seed default subjects if student has none
    if not subjects:
        defaults = [
            {"name": "Distributed Operating Systems", "code": "CS 301", "attended": 34, "held": 40, "required": 75, "faculty": "Prof. Chen"},
            {"name": "Database Management Systems", "code": "CS 305", "attended": 25, "held": 35, "required": 75, "faculty": "Prof. Miller"},
            {"name": "Artificial Intelligence & Neural Nets", "code": "CS 312", "attended": 36, "held": 38, "required": 75, "faculty": "Dr. Vaswani"},
            {"name": "Computer Networks & Protocols", "code": "CS 318", "attended": 29, "held": 32, "required": 75, "faculty": "Dr. Tanenbaum"},
        ]
        subjects = []
        for d in defaults:
            s = AttendanceSubject(user_id=user.id, **d)
            db.add(s)
            subjects.append(s)
        await db.commit()
        for s in subjects:
            await db.refresh(s)
    
    act_stmt = select(ActivityItem).where(ActivityItem.user_id == user.id)
    activities = (await db.execute(act_stmt)).scalars().all()

    return {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'college': user.college or 'University Campus',
        'course': user.course or 'Computer Science & Engineering',
        'semester': user.semester or 'Semester 1',
        'cgpa': user.cgpa,
        'github': user.github or '',
        'linkedin': user.linkedin or '',
        'is_active': user.is_active,
        'subjects': [
            {
                'id': s.id,
                'name': s.name,
                'code': s.code,
                'attended': s.attended,
                'held': s.held,
                'required': s.required,
                'faculty': s.faculty,
                'percentage': round(s.attended / s.held * 100, 1) if s.held > 0 else 0
            }
            for s in subjects
        ],
        'activities': [
            {
                'id': a.id,
                'title': a.title,
                'type': a.type,
                'subtitle': a.subtitle,
                'date': a.date,
                'description': a.description,
            }
            for a in activities
        ]
    }


class AdminAttendanceLogRequest(BaseModel):
    subject_id: str
    attended_delta: int
    held_delta: int


@router.post('/students/{student_id}/attendance/log')
async def admin_log_attendance(
    student_id: str,
    payload: AdminAttendanceLogRequest,
    admin_token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AttendanceSubject).where(
        AttendanceSubject.id == payload.subject_id,
        AttendanceSubject.user_id == student_id
    )
    subject = (await db.execute(stmt)).scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail='Subject not found for student.')

    subject.attended = max(0, subject.attended + payload.attended_delta)
    subject.held = max(1, subject.held + payload.held_delta)
    status_label = 'present' if payload.attended_delta > 0 else 'absent'
    db.add(AttendanceLog(subject_id=subject.id, status=f'admin_{status_label}', count=1))

    await db.commit()
    await db.refresh(subject)

    pct = round(subject.attended / subject.held * 100, 1) if subject.held > 0 else 0.0
    return {
        'id': subject.id,
        'name': subject.name,
        'code': subject.code,
        'attended': subject.attended,
        'held': subject.held,
        'required': subject.required,
        'percentage': pct,
        'message': 'Attendance updated by Admin'
    }


class AdminBulkAttendanceRequest(BaseModel):
    subject_id: str
    status: str
    days: int


@router.post('/students/{student_id}/attendance/bulk')
async def admin_bulk_attendance(
    student_id: str,
    payload: AdminBulkAttendanceRequest,
    admin_token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AttendanceSubject).where(
        AttendanceSubject.id == payload.subject_id,
        AttendanceSubject.user_id == student_id
    )
    subject = (await db.execute(stmt)).scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail='Subject not found for student.')

    subject.held += payload.days
    if payload.status == 'present':
        subject.attended += payload.days

    db.add(AttendanceLog(subject_id=subject.id, status=f'admin_bulk_{payload.status}', count=payload.days))
    await db.commit()
    await db.refresh(subject)

    pct = round(subject.attended / subject.held * 100, 1) if subject.held > 0 else 0.0
    return {
        'id': subject.id,
        'name': subject.name,
        'code': subject.code,
        'attended': subject.attended,
        'held': subject.held,
        'required': subject.required,
        'percentage': pct,
        'message': f'Bulk attendance logged: {payload.days} days ({payload.status})'
    }


class AdminSetAttendanceRequest(BaseModel):
    subject_id: str
    attended: int
    held: int
    required: Optional[int] = 75


@router.put('/students/{student_id}/attendance/set')
async def admin_set_attendance(
    student_id: str,
    payload: AdminSetAttendanceRequest,
    admin_token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(AttendanceSubject).where(
        AttendanceSubject.id == payload.subject_id,
        AttendanceSubject.user_id == student_id
    )
    subject = (await db.execute(stmt)).scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail='Subject not found for student.')

    subject.attended = max(0, payload.attended)
    subject.held = max(1, payload.held)
    if payload.required is not None:
        subject.required = payload.required

    await db.commit()
    await db.refresh(subject)

    pct = round(subject.attended / subject.held * 100, 1) if subject.held > 0 else 0.0
    return {
        'id': subject.id,
        'name': subject.name,
        'code': subject.code,
        'attended': subject.attended,
        'held': subject.held,
        'required': subject.required,
        'percentage': pct,
        'message': 'Attendance values overwritten by Admin'
    }


class AdminCreateSubjectRequest(BaseModel):
    name: str
    code: str
    attended: int = 0
    held: int = 0
    required: int = 75
    faculty: Optional[str] = ''


@router.post('/students/{student_id}/attendance/subject')
async def admin_create_subject(
    student_id: str,
    payload: AdminCreateSubjectRequest,
    admin_token: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    sub = AttendanceSubject(
        user_id=student_id,
        name=payload.name,
        code=payload.code,
        attended=max(0, payload.attended),
        held=max(1, payload.held),
        required=payload.required,
        faculty=payload.faculty or ''
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)

    pct = round(sub.attended / sub.held * 100, 1) if sub.held > 0 else 0.0
    return {
        'id': sub.id,
        'name': sub.name,
        'code': sub.code,
        'attended': sub.attended,
        'held': sub.held,
        'required': sub.required,
        'percentage': pct,
        'message': 'New subject enrolled by Admin'
    }
