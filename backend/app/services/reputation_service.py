from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.reputation import ReputationEvent, ReputationSnapshot
from app.models.trade import Trade
from app.services.blockchain import blockchain
from app.services.challenge_service import list_user_challenges


def _compute(trades: list[Trade], challenge_progress_sum: float) -> dict:
    count = len(trades)
    avg_score = (
        round(sum(t.review_score or 0 for t in trades) / count) if count else 0
    )
    avg_r = (
        round(sum(t.outcome_r or 0 for t in trades) / count, 2) if count else 0.0
    )
    adherence = (
        round(
            sum(1 for t in trades if t.review_violated and not t.review_violated.strip())
            / count
            * 100
        )
        if count
        else 0
    )
    challenge_bonus = round(challenge_progress_sum / 8)
    reputation = round(avg_score * 0.7 + adherence * 0.2 + challenge_bonus)
    return {
        "average_score": avg_score,
        "average_outcome_r": avg_r,
        "adherence_rate": adherence,
        "challenge_bonus": challenge_bonus,
        "reputation": reputation,
    }


async def compute_reputation(db: AsyncSession, owner_id: str) -> dict:
    res = await db.execute(select(Trade).where(Trade.owner_id == owner_id))
    trades = list(res.scalars().all())

    challenges = await list_user_challenges(db, owner_id)
    challenge_progress_sum = sum(c.get("progress", 0) for c in challenges)

    metrics = _compute(trades, challenge_progress_sum)

    # store snapshot
    snap = (
        await db.execute(
            select(ReputationSnapshot).where(ReputationSnapshot.owner_id == owner_id)
        )
    ).scalar_one_or_none()
    if not snap:
        snap = ReputationSnapshot(owner_id=owner_id)
        db.add(snap)
    snap.score = metrics["reputation"]
    snap.average_score = metrics["average_score"]
    snap.adherence_rate = metrics["adherence_rate"]
    snap.challenge_bonus = metrics["challenge_bonus"]
    snap.updated_at = datetime.now(timezone.utc)
    await db.commit()

    # mirror to on-chain reputation (best effort)
    tx = blockchain.update_reputation(owner_id, metrics["reputation"])
    if tx:
        db.add(
            ReputationEvent(
                owner_id=owner_id,
                kind="snapshot",
                delta=metrics["reputation"],
                on_chain_tx=tx,
            )
        )
        await db.commit()

    return {
        "score": metrics["reputation"],
        "average_score": metrics["average_score"],
        "average_outcome_r": metrics["average_outcome_r"],
        "adherence_rate": metrics["adherence_rate"],
        "challenge_bonus": metrics["challenge_bonus"],
        "basis": "process_score + adherence + challenge_progress",
    }


async def leaderboard(db: AsyncSession, limit: int = 10) -> list[dict]:
    res = await db.execute(
        select(ReputationSnapshot).order_by(ReputationSnapshot.score.desc()).limit(limit)
    )
    snaps = res.scalars().all()
    out = [{"owner_id": s.owner_id, "score": s.score} for s in snaps]
    if not out:
        out.append({"owner_id": "demo", "score": 0})
    return out


async def get_reputation_stats(db: AsyncSession, owner_id: str) -> dict:
    rep = await compute_reputation(db, owner_id)
    return {
        "score": rep["score"],
        "average_score": rep["average_score"],
        "average_outcome_r": rep["average_outcome_r"],
        "adherence_rate": rep["adherence_rate"],
        "challenge_bonus": rep["challenge_bonus"],
        "basis": rep["basis"],
    }