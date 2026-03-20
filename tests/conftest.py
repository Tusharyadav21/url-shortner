import os
import time
from uuid import uuid4

import httpx
import pytest

AUTH_URL = os.getenv("AUTH_URL", "http://localhost:8000")
URL_URL = os.getenv("URL_URL", "http://localhost:8000")
ANALYTICS_URL = os.getenv("ANALYTICS_URL", "http://localhost:8000")


def create_user_and_token() -> tuple[str, str]:
    email = f"test-{uuid4()}@example.com"
    password = "secret123"
    payload = {"name": "Test User", "email": email, "password": password}
    response = httpx.post(f"{AUTH_URL}/auth/signup", json=payload, timeout=10)
    response.raise_for_status()
    data = response.json()
    return data["access_token"], data["refresh_token"]


def create_short_url(token: str, destination: str = "https://example.com") -> str:
    response = httpx.post(
        f"{URL_URL}/url",
        json={"url": destination},
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    response.raise_for_status()
    return response.json()["short_id"]


@pytest.fixture(scope="session")
def services_up() -> None:
    for _ in range(30):
        try:
            health = httpx.get(f"{AUTH_URL}/health", timeout=5)
            if health.status_code == 200:
                return
        except Exception:
            pass
        time.sleep(1)
    raise RuntimeError("Services not reachable")
