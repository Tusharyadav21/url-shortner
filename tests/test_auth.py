from uuid import uuid4

import httpx

from conftest import AUTH_URL, create_user_and_token


def test_signup_returns_tokens(services_up):
    token, refresh = create_user_and_token()
    assert token
    assert refresh


def test_login_returns_tokens(services_up):
    email = f"login-{uuid4()}@example.com"
    password = "secret123"
    httpx.post(
        f"{AUTH_URL}/auth/signup",
        json={"name": "Login User", "email": email, "password": password},
        timeout=10,
    ).raise_for_status()

    response = httpx.post(
        f"{AUTH_URL}/auth/login",
        json={"email": email, "password": password},
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    assert data["access_token"]
    assert data["refresh_token"]


def test_refresh_rotates_token(services_up):
    _, refresh = create_user_and_token()
    response = httpx.post(
        f"{AUTH_URL}/auth/refresh",
        json={"refresh_token": refresh},
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    assert data["access_token"]
    assert data["refresh_token"]
    assert data["refresh_token"] != refresh
