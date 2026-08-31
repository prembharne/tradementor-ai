from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    DateTime,
    Float,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ReputationEvent(Base):
    __tablename__ = "reputation_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    owner_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    kind: Mapped[str] = mapped_column(String(48), nullable=False)
    delta: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    reference: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    on_chain_tx: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class ReputationSnapshot(Base):
    __tablename__ = "reputation_snapshots"

    owner_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    average_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    adherence_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    challenge_bonus: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
