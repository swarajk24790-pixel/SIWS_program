from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.core.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.models.activity import ActivityItem
from backend.app.schemas.activity import ActivityItemCreate, ActivityItemOut, ActivityItemUpdate
from backend.app.core.firestore_db import firestore_service
from backend.app.services.ai_service import generate_activity_bullets

router = APIRouter(prefix="/activities", tags=["Unified Activity Feed (Auto + Manual + Import)"])

@router.get("", response_model=List[ActivityItemOut])
async def get_activity_feed(
    type: Optional[str] = Query(None, description="Filter by type: hackathon, course, internship, project, responsibility"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ActivityItem).where(ActivityItem.user_id == current_user.id)
    if type and type != "All":
        stmt = stmt.where(ActivityItem.type == type.lower())
    
    stmt = stmt.order_by(ActivityItem.created_at.desc())
    result = await db.execute(stmt)
    items = result.scalars().all()

    # Seed default sample milestones if completely empty
    if not items and (not type or type == "All"):
        seed_data = [
            {
                "title": "HackMIT 2024: Decentralized Compute Mesh",
                "type": "hackathon",
                "source": "Manual",
                "subtitle": "Track Winner • Best Systems Architecture",
                "date": "October 2024",
                "description": "Architected a peer-to-peer compute sharing network using WebRTC and WASM for ephemeral AI workloads.",
                "bullets": [
                    "Won 1st Place Track Winner out of 340+ participating collegiate teams globally.",
                    "Authored distributed scheduler reducing worker peer latency by 38% under high churn.",
                    "Integrated zero-knowledge proof verification for verified deterministic node computations."
                ],
                "tags": ["Go", "WebRTC", "WASM", "Distributed Systems"]
            },
            {
                "title": "Deep Learning Specialization",
                "type": "course",
                "source": "Imported",
                "subtitle": "Coursera • DeepLearning.AI",
                "date": "September 2024",
                "description": "Mastered convolutional networks, recurrent architectures, Transformers, and optimization algorithms.",
                "bullets": [
                    "Completed 5 intensive graduate-level module series with 98.4% assessment grade.",
                    "Implemented Transformer multi-head attention mechanisms from scratch in PyTorch.",
                    "Deployed edge image classifier with TensorRT quantization on embedded hardware."
                ],
                "tags": ["PyTorch", "Transformers", "Computer Vision"]
            },
            {
                "title": "Systems Engineering Intern",
                "type": "internship",
                "source": "Manual",
                "subtitle": "Kubernetic Cloud Labs • 3 Months",
                "date": "Summer 2024",
                "description": "Contributed to Kubernetes custom resource definitions and high-throughput monitoring operators.",
                "bullets": [
                    "Built Golang microservice ingestion pipeline processing 25,000 log events/sec.",
                    "Containerized legacy monoliths to microservices orchestrated on AWS EKS.",
                    "Reduced p99 API query response time from 180ms to 42ms via Redis caching."
                ],
                "tags": ["Kubernetes", "Golang", "AWS", "Docker"]
            }
        ]
        items = []
        for s in seed_data:
            item = ActivityItem(user_id=current_user.id, **s)
            db.add(item)
            items.append(item)
        await db.commit()
        for item in items:
            await db.refresh(item)

    return items

@router.post("", response_model=ActivityItemOut)
async def add_activity_item(
    payload: ActivityItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Use AI to auto-generate recruiter bullets if none provided
    bullets = payload.bullets or []
    if not bullets and payload.description:
        try:
            bullets = await generate_activity_bullets(
                payload.title, payload.type, payload.description
            )
        except Exception:
            bullets = [
                f"Successfully completed '{payload.title}' demonstrating strong {payload.type} expertise.",
                "Applied practical engineering principles to deliver measurable outcomes.",
                "Collaborated on technical specifications, testing, and structured milestone deliverables.",
            ]

    item = ActivityItem(
        user_id=current_user.id,
        title=payload.title,
        type=payload.type,
        source=payload.source or "Manual",
        subtitle=payload.subtitle or "",
        date=payload.date or "2024",
        description=payload.description or "",
        bullets=bullets,
        tags=payload.tags or [],
        certificate_url=payload.certificate_url or "",
        repo_url=payload.repo_url or ""
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)

    # Sync to Firestore
    firestore_service.set_document("activity_items", item.id, {
        "id": item.id,
        "user_id": item.user_id,
        "title": item.title,
        "type": item.type,
        "source": item.source,
        "subtitle": item.subtitle,
        "date": item.date,
        "description": item.description,
        "bullets": item.bullets,
        "tags": item.tags
    })

    return item

@router.delete("/{item_id}")
async def delete_activity_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(ActivityItem).where(
        ActivityItem.id == item_id,
        ActivityItem.user_id == current_user.id
    )
    result = await db.execute(stmt)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Activity item not found.")
    
    await db.delete(item)
    await db.commit()

    # Sync to Firestore
    firestore_service.delete_document("activity_items", item_id)

    return {"success": True, "message": "Item deleted."}
