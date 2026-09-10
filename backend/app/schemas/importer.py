from typing import List, Optional
from pydantic import BaseModel

class GitHubRepoItem(BaseModel):
    id: int
    name: str
    full_name: str
    description: Optional[str] = ""
    stars: int = 0
    forks: int = 0
    language: Optional[str] = ""
    html_url: str
    topics: List[str] = []
    generated_bullets: List[str] = []

class GitHubImportRequest(BaseModel):
    username: str

class GitHubImportResponse(BaseModel):
    username: str
    repos_found: int
    repositories: List[GitHubRepoItem]

class CertificateParseResponse(BaseModel):
    success: bool
    title: str
    issuer: str
    platform: str
    issue_date: str
    credential_id: Optional[str] = ""
    confidence_score: float = 0.95
    suggested_bullets: List[str] = []
