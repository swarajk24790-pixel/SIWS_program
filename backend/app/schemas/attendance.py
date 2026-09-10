from typing import Optional
from pydantic import BaseModel

class AttendanceSubjectBase(BaseModel):
    name: str
    code: str
    attended: int = 0
    held: int = 0
    required: int = 75
    faculty: Optional[str] = ""

class AttendanceSubjectCreate(AttendanceSubjectBase):
    pass

class AttendanceSubjectOut(AttendanceSubjectBase):
    id: str
    user_id: str
    percentage: float = 0.0
    status: str = "safe"  # 'critical', 'warning', 'safe'

    class Config:
        from_attributes = True

class AttendanceLogRequest(BaseModel):
    attended_delta: int = 0  # e.g. 1 for present, 0 for absent
    held_delta: int = 1      # e.g. 1 class held

class BulkAttendanceRequest(BaseModel):
    subject_id: str
    status: str  # 'present' | 'absent'
    days: int = 5

class WhatIfRequest(BaseModel):
    subject_id: str
    target_percentage: int = 75

class WhatIfResponse(BaseModel):
    subject_id: str
    current_percentage: float
    target_percentage: int
    type: str  # 'bunk', 'attend', 'exact'
    count: int
    message: str
