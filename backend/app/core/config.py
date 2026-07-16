from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,        
        extra="ignore",              
    )

    app_name: str = "DeliverIQ API"
    app_version: str = "2.0.0"
    app_description: str = (
        "**DeliverIQ** — Production-grade food delivery ETA estimation engine.\n\n"
        "Uses the **Haversine formula** for precise GPS distance calculation "
        "combined with real-world traffic speed profiles to estimate delivery times.\n\n"
        "Built with FastAPI, Pydantic v2, and clean architecture principles. "
        "Suitable for integration into any food delivery platform."
    )

    host: str = "0.0.0.0"
    port: int = 8000

    api_prefix: str = "/api"
    docs_url: str = "/docs"
    redoc_url: str = "/redoc"

    cors_origins: str = "http://localhost:5173"
    
    redis_url: str = "redis://localhost:6379/0"
    weather_api_key: str | None = None

    log_level: str = "INFO"
    log_format: str = "text"

    environment: str = "development"

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

    @property
    def cors_origins_list(self) -> list[str]:
        
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        
        return self.environment == "production"

    @property
    def is_testing(self) -> bool:
        
        return self.environment == "test"

    @property
    def is_development(self) -> bool:
        
        return self.environment == "development"

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    
    return Settings()
