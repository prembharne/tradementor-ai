from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.strategy import StrategyCreate, StrategyUpdate, StrategyResponse
from app.services import strategy_service

router = APIRouter()


@router.get("/", response_model=list[StrategyResponse])
async def list_strategies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    items = await strategy_service.list_strategies(db, current_user.id)
    return [StrategyResponse.model_validate(s) for s in items]


@router.post("/", response_model=StrategyResponse, status_code=status.HTTP_201_CREATED)
async def create_strategy(
    payload: StrategyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    strategy = await strategy_service.create_strategy(db, current_user.id, payload)
    return StrategyResponse.model_validate(strategy)


@router.get("/{strategy_id}", response_model=StrategyResponse)
async def get_strategy(
    strategy_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    strategy = await strategy_service.get_strategy(db, strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return StrategyResponse.model_validate(strategy)


@router.patch("/{strategy_id}", response_model=StrategyResponse)
async def update_strategy(
    strategy_id: str,
    payload: StrategyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    strategy = await strategy_service.get_strategy(db, strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    strategy = await strategy_service.update_strategy(db, strategy, payload)
    return StrategyResponse.model_validate(strategy)


@router.delete("/{strategy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_strategy(
    strategy_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    strategy = await strategy_service.get_strategy(db, strategy_id, current_user.id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    await strategy_service.delete_strategy(db, strategy)
