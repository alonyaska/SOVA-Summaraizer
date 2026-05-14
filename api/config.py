from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    # These will be read from environment variables on Vercel
    SUPADATA_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    class Config:
        env_file = Path(__file__).parent / ".env"
        extra = "ignore"


settings = Settings()
