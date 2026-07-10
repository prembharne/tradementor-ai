from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_user_reputation():
    return {"score": 68, "basis": "process_score + adherence + challenge_progress"}


@router.get("/leaderboard")
async def get_reputation_leaderboard(limit: int = 10):
    return {"items": [{"rank": 1, "wallet": "demo", "score": 68}], "limit": limit}


@router.get("/stats")
async def get_reputation_stats():
    return {"average_score": 82, "adherence_rate": 50, "completed_challenges": 0}


@router.get("/{user_id}")
async def get_user_reputation_by_id(user_id: str):
    return {"user_id": user_id, "score": 68}
