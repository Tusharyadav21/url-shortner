from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@postgres:5432/url_shortener"
    jwt_secret: str = "change-me"
    access_token_minutes: int = 15
    refresh_token_days: int = 7
    redis_url: str = "redis://redis:6379/0"
    rabbitmq_url: str = "amqp://guest:guest@queue:5672/"
    cache_ttl_seconds: int = 3600

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
