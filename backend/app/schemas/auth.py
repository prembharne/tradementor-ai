from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    wallet_address: str = Field(..., min_length=56, max_length=56)
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    password: Optional[str] = Field(None, min_length=8, max_length=100)


class UserLogin(BaseModel):
    wallet_address: str = Field(..., min_length=56, max_length=56)
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    avatar_url: Optional[str] = None
    is_active: bool
    reputation_score: int
    total_trades: int
    completed_challenges: int
    created_at: datetime
    updated_at: datetime


class TokenPayload(BaseModel):
    sub: str
    type: str
    exp: int


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
