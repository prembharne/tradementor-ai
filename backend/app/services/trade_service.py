from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategy import Strategy
from app.models.trade import Trade
from app.schemas.trade import TradeCreate
from app.services.ai_service import ai_service
from app.services.review_engine import build_review


def _strategy_to_dict(s: Strategy) -> dict:
    return {
        "name": s.name,
        "market": s.market,
        "timeframe": s.timeframe,
        "risk_percent": s.risk_percent,
        "reward_ratio": s.reward_ratio,
        "entry_rules": [r for r in s.entry_rules.splitlines() if r.strip()],
        "exit_rules": [r for r in s.exit_rules.splitlines() if r.strip()],
    }


async def list_trades(db: AsyncSession, owner_id: str) -> list[Trade]:
    result = await db.execute(
        select(Trade).where(Trade.owner_id == owner_id).order_by(Trade.created_at.desc())
    )
    return list(result.scalars().all())


async def get_trade(db: AsyncSession, owner_id: str, trade_id: str) -> Optional[Trade]:
    result = await db.execute(
        select(Trade).where(Trade.id == trade_id, Trade.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def create_trade(db: AsyncSession, owner_id: str, payload: TradeCreate) -> Trade:
    strategy = None
    if payload.strategy_id:
        result = await db.execute(
            select(Strategy).where(
                Strategy.id == payload.strategy_id, Strategy.owner_id == owner_id
            )
        )
        strategy = result.scalar_one_or_none()

    # Deterministic review (always runs)
    outcome_r = build_review(
        Trade(
            entry=payload.entry,
            exit=payload.exit,
            stop_loss=payload.stop_loss,
            take_profit=payload.take_profit,
            risk_percent=payload.risk_percent,
            side=payload.side,
            notes=payload.notes,
            emotion=payload.emotion,
        ),
        strategy,
    )

    trade = Trade(
        owner_id=owner_id,
        strategy_id=payload.strategy_id,
        symbol=payload.symbol,
        side=payload.side,
        entry=payload.entry,
        exit=payload.exit,
        stop_loss=payload.stop_loss,
        take_profit=payload.take_profit,
        risk_percent=payload.risk_percent,
        emotion=payload.emotion,
        notes=payload.notes,
        chart_url=payload.chart_url,
        outcome_r=outcome_r["outcome_r"],
        review_score=outcome_r["score"],
        review_summary=outcome_r["summary"],
        review_followed="\n".join(outcome_r["followed"]),
        review_violated="\n".join(outcome_r["violated"]),
        review_risk=outcome_r["risk_feedback"],
        review_psychology=outcome_r["psychology"],
        review_next_step=outcome_r["next_step"],
    )
    db.add(trade)
    await db.commit()
    await db.refresh(trade)

    # AI enrichment (non-blocking, best-effort)
    if ai_service.api_key:
        trade_dict = {
            "symbol": payload.symbol,
            "side": payload.side,
            "entry": payload.entry,
            "exit": payload.exit,
            "stop_loss": payload.stop_loss,
            "take_profit": payload.take_profit,
            "risk_percent": payload.risk_percent,
            "emotion": payload.emotion,
            "notes": payload.notes,
        }
        try:
            ai_review = await ai_service.review_trade(
                trade_dict, _strategy_to_dict(strategy) if strategy else {}
            )
            if ai_review.get("score") is not None:
                trade.review_score = ai_review["score"]
            if ai_review.get("summary"):
                trade.review_summary = ai_review["summary"]
            if ai_review.get("followed"):
                trade.review_followed = "\n".join(ai_review["followed"])
            if ai_review.get("violated"):
                trade.review_violated = "\n".join(ai_review["violated"])
            if ai_review.get("risk_feedback"):
                trade.review_risk = ai_review["risk_feedback"]
            if ai_review.get("psychology"):
                trade.review_psychology = ai_review["psychology"]
            if ai_review.get("next_step"):
                trade.review_next_step = ai_review["next_step"]
            await db.commit()
            await db.refresh(trade)
        except Exception as e:
            logger.warning("AI enrichment exception", error=str(e))

    return trade


async def update_trade(
    db: AsyncSession, owner_id: str, trade_id: str, payload: TradeCreate
) -> Optional[Trade]:
    trade = await get_trade(db, owner_id, trade_id)
    if not trade:
        return None

    strategy = None
    if payload.strategy_id:
        result = await db.execute(
            select(Strategy).where(Strategy.id == payload.strategy_id, Strategy.owner_id == owner_id)
        )
        strategy = result.scalar_one_or_none()

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(trade, field, value)

    review = build_review(trade, strategy)
    trade.outcome_r = review["outcome_r"]
    trade.review_score = review["score"]
    trade.review_summary = review["summary"]
    trade.review_followed = "\n".join(review["followed"])
    trade.review_violated = "\n".join(review["violated"])
    trade.review_risk = review["risk_feedback"]
    trade.review_psychology = review["psychology"]
    trade.review_next_step = review["next_step"]

    await db.commit()
    await db.refresh(trade)
    return trade


async def delete_trade(db: AsyncSession, owner_id: str, trade_id: str) -> bool:
    trade = await get_trade(db, owner_id, trade_id)
    if not trade:
        return False
    await db.delete(trade)
    await db.commit()
    return True