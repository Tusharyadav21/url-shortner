import asyncio
import json
from datetime import datetime

import aio_pika
from fastapi import APIRouter, FastAPI
from sqlalchemy import select, text

from shared.config import settings
from shared.db import SessionLocal, init_db

from analytics.models import UrlMetricDaily, Visit

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/url/{short_id}")
async def analytics(short_id: str):
    async with SessionLocal() as session:
        total = await session.scalar(
            select(text("COALESCE(SUM(total_clicks),0)"))
            .select_from(UrlMetricDaily)
            .where(UrlMetricDaily.short_id == short_id)
        )
        rows = await session.execute(
            select(UrlMetricDaily).where(UrlMetricDaily.short_id == short_id)
        )
        daily = [
            {"date": r.date.isoformat(), "total_clicks": r.total_clicks}
            for r in rows.scalars().all()
        ]

    return {"short_id": short_id, "total_clicks": total, "daily": daily}


async def start_consumer(app: FastAPI) -> None:
    for _ in range(30):
        try:
            app.state.rabbit = await aio_pika.connect_robust(settings.rabbitmq_url)
            app.state.channel = await app.state.rabbit.channel()
            queue = await app.state.channel.declare_queue("url.events", durable=True)
            app.state.consumer_task = asyncio.create_task(_consume(queue))
            break
        except Exception:
            await asyncio.sleep(1)
    else:
        raise RuntimeError("RabbitMQ not ready")


async def _consume(queue: aio_pika.abc.AbstractQueue) -> None:
    async with queue.iterator() as queue_iter:
        async for message in queue_iter:
            async with message.process():
                try:
                    payload = json.loads(message.body.decode("utf-8"))
                    await _handle_event(payload)
                except Exception:
                    continue


async def _handle_event(payload: dict) -> None:
    short_id = payload.get("short_id")
    redirected_url = payload.get("redirected_url")
    timestamp = payload.get("timestamp")
    if not short_id or not redirected_url or not timestamp:
        return

    ts = datetime.fromisoformat(timestamp)
    day = ts.date()

    async with SessionLocal() as session:
        visit = Visit(
            short_id=short_id,
            redirected_url=redirected_url,
            timestamp=ts,
        )
        session.add(visit)
        await session.commit()

        await session.execute(
            text(
                """
                INSERT INTO url_metrics_daily (short_id, date, total_clicks)
                VALUES (:short_id, :date, 1)
                ON CONFLICT (short_id, date)
                DO UPDATE SET total_clicks = url_metrics_daily.total_clicks + 1
                """
            ),
            {"short_id": short_id, "date": day},
        )
        await session.commit()


app = FastAPI(title="Analytics Service")
app.include_router(router)


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()
    await start_consumer(app)
