from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_challenges():
    return {
        "items": [
            {"id": "risk-control", "title": "Risk Control Sprint", "progress": 20, "target": 10},
            {"id": "perfect-execution", "title": "Rule Adherence Streak", "progress": 20, "target": 5},
            {"id": "deep-review", "title": "Journal Clarity", "progress": 67, "target": 3},
        ]
    }


@router.get("/user/active")
async def get_user_active_challenges():
    return {"items": ["risk-control", "perfect-execution", "deep-review"]}


@router.get("/user/completed")
async def get_user_completed_challenges():
    return {"items": []}


@router.get("/{challenge_id}")
async def get_challenge(challenge_id: str):
    return {"id": challenge_id, "status": "active"}


@router.get("/{challenge_id}/progress")
async def get_challenge_progress(challenge_id: str):
    return {"id": challenge_id, "progress": 20, "on_chain_status": "pending_contract_deployment"}


@router.post("/{challenge_id}/join")
async def join_challenge(challenge_id: str):
    return {"id": challenge_id, "joined": True}
