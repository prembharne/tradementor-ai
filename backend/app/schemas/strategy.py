from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator


class StrategyBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    market: str = Field(default="BTCUSDT", max_length=32)
    timeframe: str = Field(default="15m", max_length=16)
    risk_percent: float = Field(default=1.0, gt=0, le=100)
    reward_ratio: float = Field(default=2.0, gt=0)
    entry_rules: list[str] = []
    exit_rules: list[str] = []
    status: str = Field(default="published", pattern="^(published|draft)$")


class StrategyCreate(StrategyBase):
    pass


class StrategyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=120)
    market: Optional[str] = Field(None, max_length=32)
    timeframe: Optional[str] = Field(None, max_length=16)
    risk_percent: Optional[float] = Field(None, gt=0, le=100)
    reward_ratio: Optional[float] = Field(None, gt=0)
    entry_rules: Optional[list[str]] = None
    exit_rules: Optional[list[str]] = None
    status: Optional[str] = Field(None, pattern="^(published|draft)$")


class StrategyResponse(StrategyBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    owner_id: str
    version: int
    on_chain_status: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    @field_validator("entry_rules", "exit_rules", mode="before")
    @classmethod
    def _split_rules(cls, v: Union[str, list[str]]) -> list[str]:
        if isinstance(v, str):
            return [line for line in v.splitlines() if line.strip()]
        return v or []
