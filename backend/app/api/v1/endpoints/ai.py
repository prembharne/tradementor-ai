from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CoachPayload(BaseModel):
    notes: str = ""
    symbol: str = "BTCUSDT"
    timeframe: str = "15m"


@router.post("/analyze-trade")
async def analyze_trade(payload: CoachPayload):
    return {
        "score": 84,
        "summary": "Trade had defined risk and usable notes. Tighten confirmation timing before adding size.",
        "risk_feedback": "Keep risk at or below the strategy cap.",
        "not_financial_advice": True,
    }


@router.post("/explain-chart")
async def explain_chart(payload: CoachPayload):
    return {
        "symbol": payload.symbol,
        "timeframe": payload.timeframe,
        "market_structure": "Continuation bias after retest; confirm invalidation before entry.",
        "not_financial_advice": True,
    }


@router.post("/coach-strategy")
async def coach_strategy(payload: CoachPayload):
    return {
        "feedback": "Rules are specific enough for review. Add one explicit no-trade condition for emotional control.",
        "not_financial_advice": True,
    }


@router.post("/weekly-report")
async def generate_weekly_report(payload: CoachPayload):
    return {
        "headline": "Process quality is improving; risk consistency is the next lever.",
        "action_items": ["Keep risk capped", "Write emotion notes", "Wait for confirmation"],
        "not_financial_advice": True,
    }
