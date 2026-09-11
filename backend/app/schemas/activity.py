from typing import List, Optional
from pydantic import BaseModel

class ActivityItemBase(BaseModel):
    title: str
    type: str  # 'hackathon', 'course', 'internship', 'project', 'responsibility'
    source: Optional[str] = "Manual"
    subtitle: Optional[str] = ""
    date: Optional[str] = ""
    description: Optional[str] = ""
    bullets: Optional[List[str]] = []
    tags: Optional[List[str]] = []
    certificate_url: Optional[str] = ""
    repo_url: Optional[str] = ""

class ActivityItemCreate(ActivityItemBase):
    pass

class ActivityItemUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    bullets: Optional[List[str]] = None
    tags: Optional[List[str]] = None

class ActivityItemOut(ActivityItemBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True
