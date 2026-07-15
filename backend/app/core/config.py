"""
core/config.py
==============
Purpose:
    Centralised application configuration via Pydantic BaseSettings.
    This is the SINGLE source of truth for every runtime parameter.
    All values are loaded from environment variables (with .env file support).

Why Pydantic BaseSettings?
    - Type-safe: wrong types raise clear errors at startup, not at runtime.
    - .env support: no manual os.getenv() calls scattered across the codebase.
    - Testable: inject different settings per test by overriding env vars.
    - Validated: Pydantic validates and coerces values when the class loads.
    - Cached: @lru_cache means .env is parsed ONCE, not per call.

12-Factor App alignment:
    All configuration comes from the environment (Factor III: Config).
    No configuration values are hardcoded in source files.

Usage:
    from app.core.config import get_settings

    settings = get_settings()
    print(settings.app_version)         # "2.0.0"
    print(settings.cors_origins_list)   # ["http://localhost:5173"]
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration, loaded from environment variables.

    Precedence (highest → lowest):
        1. Real environment variables (e.g. set in Render dashboard)
        2. .env file in the working directory
        3. Default values defined in this class
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,          # CORS_ORIGINS and cors_origins both work
        extra="ignore",                # Ignore unknown env vars — don't raise errors
    )

    # ── Application metadata ─────────────────────────────────────────────────
    app_name: str = "DeliverIQ API"
    app_version: str = "2.0.0"
    app_description: str = (
        "**DeliverIQ** — Production-grade food delivery ETA estimation engine.\n\n"
        "Uses the **Haversine formula** for precise GPS distance calculation "
        "combined with real-world traffic speed profiles to estimate delivery times.\n\n"
        "Built with FastAPI, Pydantic v2, and clean architecture principles. "
        "Suitable for integration into any food delivery platform."
    )

    # ── Server ────────────────────────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000

    # ── API ───────────────────────────────────────────────────────────────────
    api_prefix: str = "/api"
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"

    # ── CORS ──────────────────────────────────────────────────────────────────
    # Comma-separated list of allowed origins.
    # Dev default:  http://localhost:5173 (Vite dev server)
    # Prod example: https://deliver-iq.vercel.app
    cors_origins: str = "http://localhost:5173"

    # ── Logging ───────────────────────────────────────────────────────────────
    log_level: str = "INFO"
    log_format: str = "text"  # "text" for dev, "json" for production

    # ── Environment ───────────────────────────────────────────────────────────
    environment: str = "development"  # development | production | test

    # ── Validators ────────────────────────────────────────────────────────────
    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v: str) -> str:
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        upper = v.upper()
        if upper not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of {allowed}, got: {v!r}")
        return upper

    @field_validator("environment")
    @classmethod
    def validate_environment(cls, v: str) -> str:
        allowed = {"development", "production", "test"}
        lower = v.lower()
        if lower not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}, got: {v!r}")
        return lower

    # ── Derived properties ────────────────────────────────────────────────────
    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into a clean list."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        """True when running in the production environment."""
        return self.environment == "production"

    @property
    def is_testing(self) -> bool:
        """True when running under pytest."""
        return self.environment == "test"

    @property
    def is_development(self) -> bool:
        """True when running locally in development."""
        return self.environment == "development"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Returns a cached singleton Settings instance.

    The @lru_cache decorator means the .env file is parsed exactly ONCE
    for the lifetime of the process — not on every call.

    In tests, call `get_settings.cache_clear()` to force a fresh load
    after patching environment variables.

    Returns:
        Settings: Validated, fully-loaded application configuration.
    """
    return Settings()
