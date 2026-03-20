from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.sql import func

from shared.db import Base


class Url(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    short_id = Column(String(16), unique=True, index=True, nullable=False)
    redirected_url = Column(String(2048), nullable=False)
    created_by = Column(Integer, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
