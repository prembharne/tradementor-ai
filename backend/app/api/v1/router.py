from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, strategies, trades, challenges, reputation, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(strategies.router, prefix="/strategies", tags=["strategies"])
api_router.include_router(trades.router, prefix="/trades", tags=["trades"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
api_router.include_router(reputation.router, prefix="/reputation", tags=["reputation"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])