from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TradeBase(BaseModel):
    strategy_id: Optional[str] = None
    symbol: str = Field(default="BTCUSDT", max_length=32)
    side: str = Field(default="Long", pattern="^(Long|Short)$")
    entry: float
    exit: float
    stop_loss: float
    take_profit: float
    risk_percent: float = Field(default=1.0, gt=0, le=100)
    emotion: str = Field(default="Patient", max_length=32)
    notes: str = Field(default="", max_length=4000)
    chart_url: Optional[str] = Field(None, max_length=512)


class TradeCreate(TradeBase):
    pass


class TradeReview(BaseModel):
    score: Optional[int] = None
    outcome_r: Optional[float] = None
    summary: Optional[str] = None
    followed: list[str] = []
    violated: list[str] = []
    risk_feedback: Optional[str] = None
    psychology: Optional[str] = None
    next_step: Optional[str] = None


class TradeResponse(TradeBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    review: TradeReview = TradeReview()
    created_at: datetime
    updated_at: datetime
