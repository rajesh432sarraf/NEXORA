import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXORA Document Intelligence Engine"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./nexora.db"
    SYNC_DATABASE_URL: str = "sqlite:///./nexora.db"

    # Storage
    STORAGE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage")
    
    # Validation
    MAX_UPLOAD_SIZE: int = 15 * 1024 * 1024  # 15 MB limit

    # AI
    GEMINI_API_KEY: str = ""
    
    # Vector DB
    FAISS_INDEX_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "faiss_index.bin")
    FAISS_MAPPING_PATH: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "storage", "faiss_mapping.json")

    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

# Fix for Render: Render provides standard postgresql:// URLs, but SQLAlchemy asyncio requires postgresql+asyncpg://
if settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif settings.DATABASE_URL.startswith("postgresql://") and not settings.DATABASE_URL.startswith("postgresql+asyncpg://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
# Ensure storage directory exists
Path(settings.STORAGE_DIR).mkdir(parents=True, exist_ok=True)
