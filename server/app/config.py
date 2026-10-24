import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Base Directory of server
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file explicitly
ENV_FILE = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_FILE)

class Settings:
    # App
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    APP_NAME: str = os.getenv("APP_NAME", "ORBINEX")
    APP_DESCRIPTION: str = os.getenv("APP_DESCRIPTION", "AI-Powered Opportunity Intelligence Platform")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

    # Server
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "8000"))
    API_V1_PREFIX: str = os.getenv("API_V1_PREFIX", "/api/v1")

    # CORS
    _cors_raw = os.getenv("CORS_ORIGINS", '["http://localhost:3000","http://127.0.0.1:3000"]')
    try:
        CORS_ORIGINS: list[str] = json.loads(_cors_raw)
    except Exception:
        CORS_ORIGINS: list[str] = ["*"]

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'orbinex.db'}")
    DB_ECHO: bool = os.getenv("DB_ECHO", "False").lower() in ("true", "1", "yes")

    # AI & LLM Provider
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "fallback")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "gemini-1.5-flash")

    # Supabase (Auth & Storage)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Discovery & Verification
    DISCOVERY_REFRESH_INTERVAL_MINUTES: int = int(os.getenv("DISCOVERY_REFRESH_INTERVAL_MINUTES", "60"))
    DISCOVERY_MAX_PER_SOURCE: int = int(os.getenv("DISCOVERY_MAX_PER_SOURCE", "50"))
    USER_AGENT_HEADER: str = os.getenv("USER_AGENT_HEADER", "ORBINEX-Bot/1.0 (+https://orbinex.ai/bot-info)")
    HTTP_REQUEST_TIMEOUT: int = int(os.getenv("HTTP_REQUEST_TIMEOUT", "15"))

    VERIFICATION_MIN_TRUST_SCORE: int = int(os.getenv("VERIFICATION_MIN_TRUST_SCORE", "75"))
    DEDUPLICATION_SIMILARITY_THRESHOLD: float = float(os.getenv("DEDUPLICATION_SIMILARITY_THRESHOLD", "0.82"))

settings = Settings()
