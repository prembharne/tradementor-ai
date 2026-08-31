from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.challenge import Challenge, UserChallenge
from app.services.blockchain import blockchain


async def list_challenges(db: AsyncSession) -> list[Challenge]:
    result = await db.execute(select(Challenge))
    return list(result.scalars().all())


async def get_challenge(db: AsyncSession, challenge_id: str) -> Optional[Challenge]:
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    return result.scalar_one_or_none()


async def get_challenge_by_code(db: AsyncSession, code: str) -> Optional[Challenge]:
    result = await db.execute(select(Challenge).where(Challenge.code == code))
    return result.scalar_one_or_none()


async def list_user_challenges(db: AsyncSession, owner_id: str) -> list[dict]:
    result = await db.execute(
        select(UserChallenge, Challenge)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(UserChallenge.owner_id == owner_id)
    )
    items = []
    for uc, ch in result.all():
        items.append(
            {
                "id": uc.id,
                "challenge_id": ch.id,
                "code": ch.code,
                "title": ch.title,
                "description": ch.description,
                "target": ch.target,
                "metric": ch.metric,
                "progress": uc.progress,
                "completed": uc.completed,
                "on_chain_status": uc.on_chain_status,
                "completed_at": uc.completed_at,
            }
        )
    return items


async def join_challenge(db: AsyncSession, owner_id: str, challenge_id: str) -> Optional[UserChallenge]:
    # Check if already joined
    result = await db.execute(
        select(UserChallenge).where(
            UserChallenge.owner_id == owner_id, UserChallenge.challenge_id == challenge_id
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return existing

    challenge = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    ch = challenge.scalar_one_or_none()
    if not ch:
        return None

    uc = UserChallenge(
        owner_id=owner_id,
        challenge_id=challenge_id,
        progress=0,
        completed=False,
    )
    db.add(uc)
    await db.commit()
    await db.refresh(uc)
    return uc


async def evaluate_challenges(db: AsyncSession, owner_id: str) -> list[dict]:
    """Re-evaluate all user challenges against current trade data."""
    from app.models.trade import Trade

    trades_result = await db.execute(select(Trade).where(Trade.owner_id == owner_id))
    trades = list(trades_result.scalars().all())

    uc_result = await db.execute(
        select(UserChallenge, Challenge)
        .join(Challenge, UserChallenge.challenge_id == Challenge.id)
        .where(UserChallenge.owner_id == owner_id)
    )

    updated = []
    for uc, ch in uc_result.all():
        progress = 0
        if ch.metric == "trades_within_risk":
            progress = sum(
                1
                for t in trades
                if t.strategy_id
                and t.review_violated is not None
                and "Risk" not in (t.review_violated or "")
                and t.review_score
                and t.review_score >= 70
            )
        elif ch.metric == "perfect_execution":
            progress = sum(
                1
                for t in trades
                if t.review_violated is not None and not (t.review_violated or "").strip()
            )
        elif ch.metric == "detailed_reviews":
            progress = sum(1 for t in trades if t.notes and len(t.notes.strip()) >= 80)

        progress = min(progress, ch.target)
        uc.progress = progress
        was_completed = uc.completed
        uc.completed = progress >= ch.target
        if uc.completed and not was_completed:
            uc.completed_at = datetime.now(timezone.utc)
            # Submit to chain
            tx = blockchain.submit_challenge_proof(owner_id, ch.code)
            if tx:
                uc.on_chain_status = "submitted"
                uc.on_chain_tx = tx
        await db.commit()
        await db.refresh(uc)
        updated.append(
            {
                "id": uc.id,
                "challenge_id": ch.id,
                "code": ch.code,
                "title": ch.title,
                "description": ch.description,
                "target": ch.target,
                "metric": ch.metric,
                "progress": uc.progress,
                "completed": uc.completed,
                "on_chain_status": uc.on_chain_status,
                "completed_at": uc.completed_at,
            }
        )
    return updated