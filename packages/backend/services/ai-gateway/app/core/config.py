from functools import lru_cache
from typing import Optional

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str = Field(default="", alias="SUPABASE_URL")
    supabase_service_role_key: Optional[str] = Field(default=None, alias="SUPABASE_SERVICE_ROLE_KEY")
    gateway_api_key: Optional[str] = Field(default=None, alias="GATEWAY_API_KEY")
    encryption_key: Optional[str] = Field(default=None, alias="ENCRYPTION_KEY")
    encryption_secret: Optional[str] = Field(default=None, alias="ENCRYPTION_SECRET")
    openai_api_base: str = Field(default="https://api.openai.com/v1", alias="OPENAI_API_BASE")
    anthropic_api_base: str = Field(default="https://api.anthropic.com", alias="ANTHROPIC_API_BASE")
    vanchin_api_base: str = Field(default="https://vanchin.streamlake.ai/api/gateway/v1/endpoints", alias="VANCHIN_API_BASE")
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"], alias="CORS_ORIGINS")

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Optional[str | list[str]]) -> list[str]:
        if value is None:
            return ["http://localhost:3000"]
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def apply_encryption_secret(self) -> "Settings":
        if not self.encryption_key and self.encryption_secret:
            self.encryption_key = self.encryption_secret
        return self


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[arg-type]
