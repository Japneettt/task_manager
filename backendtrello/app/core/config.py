from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Backend Trello"

    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str

    GROQ_API_KEY: str

    # Add these two lines
    SMTP_EMAIL: str
    SMTP_PASSWORD: str

    class Config:
        env_file = ".env"

settings = Settings()