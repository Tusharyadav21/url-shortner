from sqlalchemy import Column, Date, DateTime, Integer, String, UniqueConstraint
from sqlalchemy.sql import func

from shared.db import Base


class Visit(Base):
    __tablename__ = "visits"

    id = Column(Integer, primary_key=True, index=True)
    short_id = Column(String(16), index=True, nullable=False)
    redirected_url = Column(String(2048), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UrlMetricDaily(Base):
    __tablename__ = "url_metrics_daily"
    __table_args__ = (UniqueConstraint("short_id", "date", name="uq_url_metrics_daily"),)

    id = Column(Integer, primary_key=True, index=True)
    short_id = Column(String(16), index=True, nullable=False)
    date = Column(Date, index=True, nullable=False)
    total_clicks = Column(Integer, nullable=False, default=0)
