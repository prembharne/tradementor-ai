from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.trade import TradeCreate, TradeResponse
from app.services import trade_service
from app.services.ai_service import ai_service
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=list[TradeResponse])
async def list_trades(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    items = await trade_service.list_trades(db, current_user.id)
    return [TradeResponse.model_validate(t) for t in items]


@router.post("/", response_model=TradeResponse, status_code=status.HTTP_201_CREATED)
async def create_trade(
    payload: TradeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    trade = await trade_service.create_trade(db, current_user.id, payload)
    return TradeResponse.model_validate(trade)


@router.get("/{trade_id}", response_model=TradeResponse)
async def get_trade(
    trade_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    trade = await trade_service.get_trade(db, trade_id, current_user.id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return TradeResponse.model_validate(trade)


@router.delete("/{trade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trade(
    trade_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    trade = await trade_service.get_trade(db, trade_id, current_user.id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    await trade_service.delete_trade(db, trade)


@router.post("/{trade_id}/analyze")
async def analyze_trade(
    trade_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    trade = await trade_service.get_trade(db, trade_id, current_user.id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    strategy = None
    if trade.strategy_id:
        from app.services import strategy_service

        strategy = await strategy_service.get_strategy(db, trade.strategy_id, current_user.id)
    from app.models.strategy import Strategy

    trade_dict = {
        "symbol": trade.symbol,
        "side": trade.side,
        "entry": trade.entry,
        "exit": trade.exit,
        "stop_loss": trade.stop_loss,
        "take_profit": trade.take_profit,
        "risk_percent": trade.risk_percent,
        "emotion": trade.emotion,
        "notes": trade.notes,
    }
    strategy_dict = (
        {
            "name": strategy.name,
            "market": strategy.market,
            "timeframe": strategy.timeframe,
            "risk_percent": strategy.risk_percent,
            "reward_ratio": strategy.reward_ratio,
            "entry_rules": [r for r in strategy.entry_rules.splitlines() if r.strip()],
            "exit_rules": [r for r in strategy.exit_rules.splitlines() if r.strip()],
        }
        if strategy
        else {}
    )
    review = await ai_service.review_trade(trade_dict, strategy_dict)
    return {"trade_id": trade_id, "review": review, "not_financial_advice": True}
