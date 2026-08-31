from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    DateTime,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Trade(Base):
    __tablename__ = "trades"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    owner_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    strategy_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    symbol: Mapped[str] = mapped_column(String(32), nullable=False, default="BTCUSDT")
    side: Mapped[str] = mapped_column(String(16), nullable=False, default="Long")
    entry: Mapped[float] = mapped_column(Float, nullable=False)
    exit: Mapped[float] = mapped_column(Float, nullable=False)
    stop_loss: Mapped[float] = mapped_column(Float, nullable=False)
    take_profit: Mapped[float] = mapped_column(Float, nullable=False)
    risk_percent: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    emotion: Mapped[str] = mapped_column(String(32), nullable=False, default="Patient")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    chart_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # AI review output
    review_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    outcome_r: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    review_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_followed: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_violated: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_risk: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_psychology: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_next_step: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    @property
    def review(self) -> dict:
        return {
            "score": self.review_score,
            "outcome_r": self.outcome_r,
            "summary": self.review_summary,
            "followed": [f for f in (self.review_followed or "").splitlines() if f.strip()],
            "violated": [v for v in (self.review_violated or "").splitlines() if v.strip()],
            "risk_feedback": self.review_risk,
            "psychology": self.review_psychology,
            "next_step": self.review_next_step,
        }
