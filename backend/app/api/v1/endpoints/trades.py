from datetime import datetime
from uuid import uuid4
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class TradePayload(BaseModel):
    strategy_id: str
    symbol: str = "BTCUSDT"
    side: str = "Long"
    entry: float
    exit: float
    stop_loss: float
    take_profit: float
    risk_percent: float
    notes: str
    emotion: str = "Patient"


def outcome_r(payload: TradePayload) -> float:
    risk = abs(payload.entry - payload.stop_loss)
    if risk == 0:
        return 0
    pnl = payload.exit - payload.entry if payload.side.lower() == "long" else payload.entry - payload.exit
    return round(pnl / risk, 2)


@router.get("/")
async def list_trades():
    return {
        "items": [
            {
                "id": "trade-btc-001",
                "symbol": "BTCUSDT",
                "score": 92,
                "outcome_r": 2.61,
                "review": "Strong rule adherence with clean risk sizing.",
            }
        ],
        "count": 1,
    }


@router.post("/")
async def create_trade(payload: TradePayload):
    score = 90 if payload.risk_percent <= 1 else 68
    return {
        "id": str(uuid4()),
        **payload.model_dump(),
        "created_at": datetime.utcnow().isoformat(),
        "outcome_r": outcome_r(payload),
        "review_score": score,
    }


@router.get("/{trade_id}")
async def get_trade(trade_id: str):
    return {"id": trade_id, "status": "ready_for_review"}


@router.patch("/{trade_id}")
async def update_trade(trade_id: str, payload: TradePayload):
    return {"id": trade_id, **payload.model_dump(), "updated_at": datetime.utcnow().isoformat()}


@router.delete("/{trade_id}")
async def delete_trade(trade_id: str):
    return {"id": trade_id, "deleted": True}


@router.post("/{trade_id}/analyze")
async def analyze_trade(trade_id: str):
    return {
        "trade_id": trade_id,
        "score": 84,
        "summary": "Risk and reward were defined. Review confirmation timing before the next entry.",
        "not_financial_advice": True,
    }
