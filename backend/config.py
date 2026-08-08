from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Sahaya AI"
    API_V1_STR: str = "/api/v1"
    
    # Security
    JWT_SECRET: str = "supersecretjwtkeyforlocaldevelopmentonly" # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 3600
    
    # Database
    DATABASE_URL: str = "sqlite:///./sahaya_ai.db"
    
    # NVIDIA NIM AI Configuration
    NIM_API_KEY: Optional[str] = None
    NIM_MODEL: str = "meta/llama3-70b-instruct"
    NIM_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    
    # Dev settings
    SEED_ON_STARTUP: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
