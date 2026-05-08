from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    SUPADATA_API_KEY: str
    GEMINI_API_KEY: str

    class Config:
        env_file = Path(__file__).parent / ".env"


settings = Settings()
