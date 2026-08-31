from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class Strategy(Base):
    __tablename__ = "strategies"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid4())
    )
    owner_id: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    market: Mapped[str] = mapped_column(String(32), nullable=False, default="BTCUSDT")
    timeframe: Mapped[str] = mapped_column(String(16), nullable=False, default="15m")
    risk_percent: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    reward_ratio: Mapped[float] = mapped_column(Float, nullable=False, default=2.0)
    entry_rules: Mapped[str] = mapped_column(Text, nullable=False, default="")
    exit_rules: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[str] = mapped_column(String(16), nullable=False, default="published")
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    on_chain_status: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    on_chain_tx: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
