from datetime import datetime, timezone
from typing import Optional
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.strategy import Strategy
from app.schemas.strategy import StrategyCreate, StrategyUpdate
from app.services.blockchain import blockchain


async def list_strategies(db: AsyncSession, owner_id: str) -> list[Strategy]:
    result = await db.execute(
        select(Strategy).where(Strategy.owner_id == owner_id).order_by(Strategy.created_at.desc())
    )
    return list(result.scalars().all())


async def get_strategy(db: AsyncSession, owner_id: str, strategy_id: str) -> Optional[Strategy]:
    result = await db.execute(
        select(Strategy).where(Strategy.id == strategy_id, Strategy.owner_id == owner_id)
    )
    return result.scalar_one_or_none()


async def create_strategy(db: AsyncSession, owner_id: str, payload: StrategyCreate) -> Strategy:
    strategy = Strategy(
        id=str(uuid4()),
        owner_id=owner_id,
        name=payload.name,
        market=payload.market,
        timeframe=payload.timeframe,
        risk_percent=payload.risk_percent,
        reward_ratio=payload.reward_ratio,
        entry_rules="\n".join(payload.entry_rules),
        exit_rules="\n".join(payload.exit_rules),
        status=payload.status,
        version=1 if payload.status == "published" else 0,
    )
    db.add(strategy)
    await db.commit()
    await db.refresh(strategy)
    tx = blockchain.version_strategy(strategy.id, strategy.version, owner_id)
    if tx:
        strategy.on_chain_status = "submitted"
        strategy.on_chain_tx = tx
        await db.commit()
        await db.refresh(strategy)
    return strategy


async def update_strategy(
    db: AsyncSession, owner_id: str, strategy_id: str, payload: StrategyUpdate
) -> Optional[Strategy]:
    strategy = await get_strategy(db, owner_id, strategy_id)
    if not strategy:
        return None
    data = payload.model_dump(exclude_unset=True)
    if "entry_rules" in data:
        data["entry_rules"] = "\n".join(data["entry_rules"])
    if "exit_rules" in data:
        data["exit_rules"] = "\n".join(data["exit_rules"])
    if "status" in data and data["status"] == "published" and strategy.version == 0:
        strategy.version = 1
    for field, value in data.items():
        setattr(strategy, field, value)
    strategy.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(strategy)
    tx = blockchain.version_strategy(strategy.id, strategy.version, strategy.owner_id)
    if tx:
        strategy.on_chain_status = "submitted"
        strategy.on_chain_tx = tx
        await db.commit()
        await db.refresh(strategy)
    return strategy


async def delete_strategy(db: AsyncSession, owner_id: str, strategy_id: str) -> bool:
    strategy = await get_strategy(db, owner_id, strategy_id)
    if not strategy:
        return False
    await db.delete(strategy)
    await db.commit()
    return True


async def publish_version(db: AsyncSession, owner_id: str, strategy_id: str) -> Optional[Strategy]:
    strategy = await get_strategy(db, owner_id, strategy_id)
    if not strategy:
        return None
    strategy.version += 1
    strategy.on_chain_status = "queued_for_soroban_submission"
    strategy.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(strategy)
    return strategy