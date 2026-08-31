from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import select
from app.core.config import settings


class Base(DeclarativeBase):
    pass


engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncSession:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def seed_challenges(db: AsyncSession) -> None:
    """Seed default challenges if none exist."""
    from app.models.challenge import Challenge

    result = await db.execute(select(Challenge))
    if result.scalars().first():
        return  # Already seeded

    challenges = [
        Challenge(
            code="risk-control",
            title="Risk Control",
            description="Complete 5 trades where no risk rule was violated and review score >= 70",
            target=5,
            metric="trades_within_risk",
        ),
        Challenge(
            code="perfect-execution",
            title="Perfect Execution",
            description="Complete 3 trades with zero rule violations",
            target=3,
            metric="perfect_execution",
        ),
        Challenge(
            code="detailed-reviews",
            title="Detailed Reviews",
            description="Log 5 trades with detailed notes (80+ chars)",
            target=5,
            metric="detailed_reviews",
        ),
        Challenge(
            code="weekly-consistency",
            title="Weekly Consistency",
            description="Complete 7 trades within risk rules in a single week",
            target=7,
            metric="trades_within_risk",
        ),
    ]

    db.add_all(challenges)
    await db.commit()


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed default data
    async with async_session_maker() as session:
        await seed_challenges(session)


async def close_db() -> None:
    await engine.dispose()