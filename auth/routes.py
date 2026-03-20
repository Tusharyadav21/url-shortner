from datetime import datetime, timezone

from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.security import create_access_token
from shared.db import get_session, init_db

from auth.models import RefreshToken, User
from auth.schemas import LoginRequest, RefreshRequest, SignupRequest, TokenResponse
from auth.security import (
    create_refresh_token,
    hash_password,
    hash_token,
    refresh_expiry,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse)
async def signup(payload: SignupRequest, session: AsyncSession = Depends(get_session)):
    existing = await session.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": user.role, "name": user.name})
    refresh_token = create_refresh_token()
    refresh = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        revoked=False,
        expires_at=refresh_expiry(),
    )
    session.add(refresh)
    await session.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)):
    user = await session.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.id), "role": user.role, "name": user.name})
    refresh_token = create_refresh_token()
    refresh = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        revoked=False,
        expires_at=refresh_expiry(),
    )
    session.add(refresh)
    await session.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(payload: RefreshRequest, session: AsyncSession = Depends(get_session)):
    token_hash_value = hash_token(payload.refresh_token)
    refresh_token_row = await session.scalar(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash_value)
    )
    if not refresh_token_row or refresh_token_row.revoked:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if refresh_token_row.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    refresh_token_row.revoked = True
    await session.commit()

    user = await session.scalar(select(User).where(User.id == refresh_token_row.user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user")

    access_token = create_access_token({"sub": str(user.id), "role": user.role, "name": user.name})
    new_refresh = create_refresh_token()
    refresh = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(new_refresh),
        revoked=False,
        expires_at=refresh_expiry(),
    )
    session.add(refresh)
    await session.commit()

    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


app = FastAPI(title="Auth Service")
app.include_router(router)


@app.on_event("startup")
async def on_startup() -> None:
    await init_db()
