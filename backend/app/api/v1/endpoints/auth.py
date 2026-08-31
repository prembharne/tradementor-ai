from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
    get_password_hash,
    decode_token,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user with wallet address."""
    # Check if user exists
    result = await db.execute(select(User).where(User.wallet_address == user_in.wallet_address))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Wallet address already registered",
        )

    # Create user
    hashed_password = get_password_hash(user_in.password) if user_in.password else None

    user = User(
        wallet_address=user_in.wallet_address,
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_password,
        is_active=True,
        reputation_score=0,
        total_trades=0,
        completed_challenges=0,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Generate tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/login", response_model=Token)
async def login(
    wallet_address: str,
    password: str = None,
    db: AsyncSession = Depends(get_db),
):
    """Login with wallet address and optional password."""
    result = await db.execute(select(User).where(User.wallet_address == wallet_address))
    user = result.scalar_one_or_none()

    if not user:
        if password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        # Auto-provision wallet user
        user = User(
            wallet_address=wallet_address,
            username=f"trader_{wallet_address[-6:]}" if len(wallet_address) >= 6 else "demo_trader",
            is_active=True,
            reputation_score=75,
            total_trades=0,
            completed_challenges=0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if user.hashed_password and password:
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
    elif user.hashed_password and not password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Password required",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using refresh token."""
    payload = decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    new_access_token = create_access_token(data={"sub": str(user.id)})
    new_refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/verify-wallet")
async def verify_wallet_signature(
    wallet_address: str,
    signature: str,
    message: str,
    db: AsyncSession = Depends(get_db),
):
    """Verify Freighter wallet signature for passwordless auth."""
    from stellar_sdk import Keypair

    try:
        keypair = Keypair.from_public_key(wallet_address)
        keypair.verify(message.encode(), signature)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid signature",
        )

    # Check if user exists
    result = await db.execute(select(User).where(User.wallet_address == wallet_address))
    user = result.scalar_one_or_none()

    if not user:
        # Create new user with wallet
        user = User(
            wallet_address=wallet_address,
            username=wallet_address[:12] + "..." + wallet_address[-4:],
            is_active=True,
            reputation_score=0,
            total_trades=0,
            completed_challenges=0,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user