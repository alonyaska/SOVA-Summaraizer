from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # These will be read from environment variables on Vercel
    SUPADATA_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        # If .env exists, it will be loaded, but it's not required
        env_file = ".env"
        extra = "ignore"


settings = Settings()
