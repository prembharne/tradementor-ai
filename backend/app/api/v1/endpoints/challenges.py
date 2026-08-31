from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.challenge import Challenge
from app.models.user import User
from app.services import challenge_service

router = APIRouter()


@router.get("/")
async def list_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # Return all available challenges (not just joined ones)
    result = await db.execute(select(Challenge))
    challenges = list(result.scalars().all())
    items = [
        {
            "id": c.id,
            "challenge_id": c.id,
            "code": c.code,
            "title": c.title,
            "description": c.description,
            "target": c.target,
            "metric": c.metric,
            "progress": 0,
            "completed": False,
            "on_chain_status": None,
            "completed_at": None,
        }
        for c in challenges
    ]
    return {"items": items}


@router.get("/joined")
async def list_joined_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    items = await challenge_service.list_user_challenges(db, current_user.id)
    return {"items": items}


@router.get("/user/active")
async def get_user_active_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    items = await challenge_service.list_user_challenges(db, current_user.id)
    return {"items": [c["code"] for c in items if not c["completed"]]}


@router.get("/user/completed")
async def get_user_completed_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    items = await challenge_service.list_user_challenges(db, current_user.id)
    return {"items": [c["code"] for c in items if c["completed"]]}


@router.get("/{challenge_id}")
async def get_challenge(
    challenge_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    items = await challenge_service.list_user_challenges(db, current_user.id)
    ch = next((c for c in items if c["id"] == challenge_id), None)
    if not ch:
        return {"id": challenge_id, "status": "not_found"}
    return ch


@router.get("/{challenge_id}/progress")
async def get_challenge_progress(
    challenge_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    items = await challenge_service.list_user_challenges(db, current_user.id)
    ch = next((c for c in items if c["id"] == challenge_id), None)
    if not ch:
        return {"id": challenge_id, "progress": 0, "on_chain_status": "not_found"}
    return {
        "id": ch["id"],
        "code": ch["code"],
        "progress": ch["progress"],
        "target": ch["target"],
        "completed": ch["completed"],
        "on_chain_status": ch.get("on_chain_status"),
    }


@router.post("/{challenge_id}/join")
async def join_challenge(
    challenge_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    uc = await challenge_service.join_challenge(db, current_user.id, challenge_id)
    if not uc:
        return {"id": challenge_id, "joined": False, "error": "Challenge not found"}
    return {"id": challenge_id, "joined": True, "progress": uc.progress}


@router.post("/evaluate")
async def evaluate_all_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    updated = await challenge_service.evaluate_challenges(db, current_user.id)
    return {"items": updated}