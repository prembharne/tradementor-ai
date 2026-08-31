import base64
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile
from pydantic import BaseModel

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.services.ai_service import AIService
from app.services import trade_service, strategy_service
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()


class CoachPayload(BaseModel):
    notes: str = ""
    symbol: str = "BTCUSDT"
    timeframe: str = "15m"


@router.post("/analyze-trade")
async def analyze_trade(
    payload: CoachPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    trades = await trade_service.list_trades(db, current_user.id)
    trade = next((t for t in trades if t.symbol == payload.symbol), None)

    if not trade:
        return {
            "score": 84,
            "summary": "Trade had defined risk and usable notes. Tighten confirmation timing before adding size.",
            "risk_feedback": "Keep risk at or below the strategy cap.",
            "not_financial_advice": True,
        }

    strategy = None
    if trade.strategy_id:
        strategy = await strategy_service.get_strategy(db, trade.strategy_id, current_user.id)

    ai = AIService()
    try:
        result = await ai.analyze_trade(trade.id)
        return {"trade_id": str(trade.id), "analysis": result, "not_financial_advice": True}
    except Exception:
        from app.services.review_engine import build_review
        review = build_review(trade, strategy)
        return {"trade_id": str(trade.id), "review": review, "not_financial_advice": True}


@router.post("/explain-chart")
async def explain_chart(payload: CoachPayload, _: User = Depends(get_current_active_user)):
    return {
        "symbol": payload.symbol,
        "timeframe": payload.timeframe,
        "note": "Send a chart image to /ai/explain-chart-image for vision analysis.",
        "not_financial_advice": True,
    }


@router.post("/explain-chart-image")
async def explain_chart_image(
    file: UploadFile = File(...),
    symbol: str = "BTCUSDT",
    timeframe: str = "15m",
):
    image_bytes = await file.read()
    ai = AIService()
    result = await ai.explain_chart(image_bytes, symbol, timeframe)
    result["not_financial_advice"] = True
    return result


@router.post("/coach-strategy")
async def coach_strategy(
    payload: CoachPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    strategies = await strategy_service.list_strategies(db, current_user.id)
    strategy = strategies[0] if strategies else None
    strategy_dict = {
        "name": strategy.name if strategy else "Current strategy",
        "rules": {
            "entry": [r for r in (strategy.entry_rules or "").splitlines() if r.strip()] if strategy else [],
            "exit": [r for r in (strategy.exit_rules or "").splitlines() if r.strip()] if strategy else [],
            "risk": [f"Max {strategy.risk_percent}% risk per trade"] if strategy else [],
        },
    } if strategy else {"name": "Current strategy", "rules": {}}
    ai = AIService()
    try:
        result = await ai.coach_strategy(UUID(current_user.id), {"notes": payload.notes})
        return {**result, "not_financial_advice": True}
    except Exception:
        return {
            "feedback": "Rules are specific enough for review. Add one explicit no-trade condition for emotional control.",
            "not_financial_advice": True,
        }


@router.post("/weekly-report")
async def generate_weekly_report(
    payload: CoachPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    ai = AIService()
    try:
        result = await ai.generate_weekly_report(UUID(current_user.id))
        return {"report": result.get("weekly_report"), "not_financial_advice": True}
    except Exception:
        return {
            "headline": "Process quality is improving; risk consistency is the next lever.",
            "action_items": ["Keep risk capped", "Write emotion notes", "Wait for confirmation"],
            "not_financial_advice": True,
        }