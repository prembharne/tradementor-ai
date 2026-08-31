from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.services import reputation_service


router = APIRouter()


@router.get("/")
async def get_user_reputation(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await reputation_service.compute_reputation(db, current_user.id)


@router.get("/leaderboard")
async def get_reputation_leaderboard(
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    return {"items": await reputation_service.leaderboard(db, limit), "limit": limit}


@router.get("/stats")
async def get_reputation_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    rep = await reputation_service.compute_reputation(db, current_user.id)
    return {
        "average_score": rep["average_score"],
        "adherence_rate": rep["adherence_rate"],
        "completed_challenges": rep["challenge_bonus"],
        "reputation": rep["score"],
    }


@router.get("/{user_id}")
async def get_user_reputation_by_id(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    return await reputation_service.compute_reputation(db, user_id)