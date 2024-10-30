import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    CELERY_BROKER_URL: str = os.environ.get("CELERY_BROKER_URL", "redis://redis:6379/0")
    CELERY_RESULT_BACKEND: str = os.environ.get(
        "CELERY_RESULT_BACKEND", "redis://redis:6379/0"
    )
    REDIS_URL: str = os.environ.get("REDIS_URL", "redis://redis:6379")


settings = Config()
