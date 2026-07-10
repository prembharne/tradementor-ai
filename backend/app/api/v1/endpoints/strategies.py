from datetime import datetime
from uuid import uuid4
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class StrategyPayload(BaseModel):
    name: str = Field(..., min_length=3)
    market: str = "BTCUSDT"
    timeframe: str = "15m"
    risk_percent: float = 1.0
    reward_ratio: float = 2.0
    entry_rules: list[str] = []
    exit_rules: list[str] = []
    status: str = "published"


DEMO_STRATEGIES = [
    {
        "id": "strategy-london-breakout",
        "name": "London Breakout Discipline",
        "market": "BTCUSDT",
        "timeframe": "15m",
        "risk_percent": 1.0,
        "reward_ratio": 2.2,
        "version": 3,
        "status": "published",
        "on_chain_status": "ready_for_testnet_contract",
    }
]


@router.get("/")
async def list_strategies():
    return {"items": DEMO_STRATEGIES, "count": len(DEMO_STRATEGIES)}


@router.post("/")
async def create_strategy(payload: StrategyPayload):
    strategy = payload.model_dump()
    strategy.update(
        {
            "id": str(uuid4()),
            "version": 1 if payload.status == "published" else 0,
            "created_at": datetime.utcnow().isoformat(),
            "on_chain_status": "pending_contract_deployment",
        }
    )
    return strategy


@router.get("/{strategy_id}")
async def get_strategy(strategy_id: str):
    return next((item for item in DEMO_STRATEGIES if item["id"] == strategy_id), {"id": strategy_id, "status": "not_found"})


@router.patch("/{strategy_id}")
async def update_strategy(strategy_id: str, payload: StrategyPayload):
    strategy = payload.model_dump()
    strategy.update({"id": strategy_id, "version": 2, "updated_at": datetime.utcnow().isoformat()})
    return strategy


@router.delete("/{strategy_id}")
async def delete_strategy(strategy_id: str):
    return {"id": strategy_id, "deleted": True}


@router.post("/{strategy_id}/version")
async def create_strategy_version(strategy_id: str):
    return {
        "strategy_id": strategy_id,
        "version": 2,
        "on_chain_status": "queued_for_soroban_submission",
        "created_at": datetime.utcnow().isoformat(),
    }
