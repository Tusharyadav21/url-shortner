import asyncio

import aio_pika
import redis.asyncio as redis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from analytics.routes import router as analytics_router, start_consumer
from auth.routes import router as auth_router
from shared.config import settings
from shared.db import init_db
from url.routes import router as url_router

app = FastAPI(title="URL Shortener")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # TODO : URLs comes from ENV
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://0.0.0.0:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(url_router)
app.include_router(analytics_router)


@app.on_event("startup")
async def on_startup() -> None:
    for _ in range(30):
        try:
            await init_db()
            break
        except Exception:
            await asyncio.sleep(1)
    else:
        raise RuntimeError("Database not ready")

    app.state.redis = await redis.from_url(settings.redis_url, decode_responses=True)

    for _ in range(30):
        try:
            app.state.rabbit = await aio_pika.connect_robust(settings.rabbitmq_url)
            app.state.channel = await app.state.rabbit.channel()
            await app.state.channel.declare_queue("url.events", durable=True)
            break
        except Exception:
            await asyncio.sleep(1)
    else:
        raise RuntimeError("RabbitMQ not ready")

    await start_consumer(app)


@app.on_event("shutdown")
async def on_shutdown() -> None:
    if getattr(app.state, "consumer_task", None):
        app.state.consumer_task.cancel()
    if getattr(app.state, "redis", None):
        await app.state.redis.close()
    if getattr(app.state, "rabbit", None):
        await app.state.rabbit.close()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "app"}
