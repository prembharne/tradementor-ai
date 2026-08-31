from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # Application
    APP_NAME: str = "TradeMentor AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./tradementor.db"

    # JWT
    JWT_SECRET_KEY: str = Field(..., min_length=32)
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Stellar / Soroban
    STELLAR_NETWORK: str = "testnet"
    STELLAR_RPC_URL: str = "https://soroban-testnet.stellar.org"
    STELLAR_NETWORK_PASSPHRASE: str = "Test SDF Network ; September 2015"
    FREIGHTER_APP_ID: str = "tradementor-ai"

    # Soroban Contract Addresses (set after deployment)
    STRATEGY_CONTRACT_ADDRESS: Optional[str] = None
    CHALLENGE_CONTRACT_ADDRESS: Optional[str] = None
    REPUTATION_CONTRACT_ADDRESS: Optional[str] = None

    # AI Services
    AI_PROVIDER: str = "openrouter"
    OPENROUTER_API_KEY: Optional[str] = None
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"
    LLM_MODEL: str = "dots-studio/dots-3-note-preview:free"
    VISION_MODEL: str = "dots-studio/dots-3-note-preview:free"

    # External APIs
    COINGECKO_API_KEY: Optional[str] = None
    TWELVE_DATA_API_KEY: Optional[str] = None

    # Frontend
    FRONTEND_URL: str = "http://localhost:5173"

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def database_url_sync(self) -> str:
        """Convert async URL to sync for Alembic."""
        if self.DATABASE_URL.startswith("postgresql+asyncpg"):
            return self.DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
        if self.DATABASE_URL.startswith("sqlite+aiosqlite"):
            return self.DATABASE_URL.replace("sqlite+aiosqlite", "sqlite")
        return self.DATABASE_URL


settings = Settings()