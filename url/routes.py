import asyncio
import json
import secrets
import string
from datetime import datetime, timezone

import aio_pika
import redis.asyncio as redis
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.config import settings
from shared.db import get_session, init_db
from shared.security import decode_access_token

from url.models import Url
from url.schemas import URLCreate, URLResponse

router = APIRouter(tags=["url"])
security = HTTPBearer()


def _generate_short_id(length: int = 8) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _cache_key(short_id: str) -> str:
    return f"url:{short_id}"


def _get_auth_payload(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    try:
        return decode_access_token(credentials.credentials)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


@router.post("/url", response_model=URLResponse)
async def create_url(
    payload: URLCreate,
    session: AsyncSession = Depends(get_session),
    user: dict = Depends(_get_auth_payload),
):
    short_id = _generate_short_id()
    while await session.scalar(select(Url).where(Url.short_id == short_id)):
        short_id = _generate_short_id()

    url = Url(
        short_id=short_id,
        redirected_url=str(payload.url),
        created_by=int(user.get("sub")),
    )
    session.add(url)
    await session.commit()

    return URLResponse(short_id=short_id)


@router.get("/url/{short_id}")
async def redirect_url(
    short_id: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    cached = await request.app.state.redis.get(_cache_key(short_id))
    if cached:
        await _publish_event(request, short_id, cached)
        return RedirectResponse(url=cached, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    result = await session.scalar(select(Url).where(Url.short_id == short_id))
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short URL not found")

    await request.app.state.redis.setex(
        _cache_key(short_id), settings.cache_ttl_seconds, result.redirected_url
    )
    await _publish_event(request, short_id, result.redirected_url)
    return RedirectResponse(url=result.redirected_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/url/resolve/{short_id}")
async def resolve_url(
    short_id: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    cached = await request.app.state.redis.get(_cache_key(short_id))
    if cached:
        return {"short_id": short_id, "redirected_url": cached}

    result = await session.scalar(select(Url).where(Url.short_id == short_id))
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short URL not found")

    await request.app.state.redis.setex(
        _cache_key(short_id), settings.cache_ttl_seconds, result.redirected_url
    )
    return {"short_id": short_id, "redirected_url": result.redirected_url}


async def _publish_event(request: Request, short_id: str, redirected_url: str) -> None:
    event = {
        "short_id": short_id,
        "redirected_url": redirected_url,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    message = aio_pika.Message(body=json.dumps(event).encode("utf-8"))
    await request.app.state.channel.default_exchange.publish(message, routing_key="url.events")


app = FastAPI(title="URL Service")
app.include_router(router)


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()
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


@app.on_event("shutdown")
async def on_shutdown() -> None:
    if getattr(app.state, "redis", None):
        await app.state.redis.close()
    if getattr(app.state, "rabbit", None):
        await app.state.rabbit.close()
