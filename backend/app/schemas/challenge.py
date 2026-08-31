from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    code: str
    title: str
    description: str
    target: int
    metric: str


class UserChallengeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    challenge_id: str
    progress: int
    target: int
    completed: bool
    on_chain_status: Optional[str] = None
    completed_at: Optional[datetime] = None
