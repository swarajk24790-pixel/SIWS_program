from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.activity import ActivityItem
from backend.app.schemas.importer import (
    GitHubImportRequest,
    GitHubImportResponse,
    GitHubRepoItem,
    CertificateParseResponse
)
from backend.app.services.github_service import fetch_github_repos
from backend.app.services.certificate_parser import parse_certificate_pdf

router = APIRouter(prefix="/import", tags=["Certificate & GitHub Importer"])

@router.post("/github", response_model=GitHubImportResponse)
async def import_github_repos(
    payload: GitHubImportRequest,
    current_user: User = Depends(get_current_user)
):
    if not payload.username.strip():
        raise HTTPException(status_code=400, detail="GitHub username is required.")

    repos = await fetch_github_repos(payload.username.strip())
    repo_items = [GitHubRepoItem(**r) for r in repos]
    return GitHubImportResponse(
        username=payload.username,
        repos_found=len(repo_items),
        repositories=repo_items
    )

@router.post("/github/commit")
async def commit_github_repo_to_feed(
    repo: GitHubRepoItem,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Inserts a selected GitHub repository into the Unified Activity Feed."""
    item = ActivityItem(
        user_id=current_user.id,
        title=f"Open-Source Project: {repo.name}",
        type="project",
        source="Imported",
        subtitle=f"GitHub Repository • {repo.language}",
        date="Recent",
        description=repo.description or f"High-performance {repo.language} codebase.",
        bullets=repo.generated_bullets,
        tags=[repo.language] + (repo.topics[:3] if repo.topics else []),
        repo_url=repo.html_url
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"success": True, "activity_id": item.id, "title": item.title}

@router.post("/certificate", response_model=CertificateParseResponse)
async def parse_certificate(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF certificates are supported for extraction.")

    file_bytes = await file.read()
    result = parse_certificate_pdf(file_bytes, file.filename)
    return CertificateParseResponse(**result)

@router.post("/certificate/commit")
async def commit_certificate_to_feed(
    cert: CertificateParseResponse,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Inserts parsed certificate into the Unified Activity Feed."""
    item = ActivityItem(
        user_id=current_user.id,
        title=cert.title,
        type="course",
        source="Imported",
        subtitle=f"{cert.platform} • {cert.issuer}",
        date=cert.issue_date,
        description=f"Verified academic credential awarded by {cert.issuer} on {cert.platform}.",
        bullets=cert.suggested_bullets,
        tags=["Certification", cert.platform]
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"success": True, "activity_id": item.id, "title": item.title}
