from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.future import select

from common_models import APICredentialCreate, APICredentialResponse, UserSession
from middleware.firebase_auth import get_current_user, security
from database import (
    AsyncSessionLocal,
    APICredentialModel,
    encrypt_secret,
)

router = APIRouter(prefix="/api/v1/credentials", tags=["Broker Credentials"])


@router.post("", response_model=APICredentialResponse)
async def store_credentials(
    req: APICredentialCreate,
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    async with AsyncSessionLocal() as session:
        # Check if credential already exists for this broker/environment
        result = await session.execute(
            select(APICredentialModel).where(
                APICredentialModel.user_id == user_session.user_id,
                APICredentialModel.broker_name == req.broker_name.value,
                APICredentialModel.environment == req.environment.value,
            )
        )
        existing = result.scalars().first()

        encrypted_key = encrypt_secret(req.api_key)
        encrypted_secret = encrypt_secret(req.api_secret)
        encrypted_passphrase = encrypt_secret(req.passphrase) if req.passphrase else None

        if existing:
            existing.encrypted_api_key = encrypted_key
            existing.encrypted_api_secret = encrypted_secret
            existing.encrypted_passphrase = encrypted_passphrase
            existing.key_version += 1
            existing.is_active = True
            await session.commit()
            await session.refresh(existing)
            return existing

        new_cred = APICredentialModel(
            user_id=user_session.user_id,
            tenant_id=user_session.tenant_id,
            broker_name=req.broker_name.value,
            environment=req.environment.value,
            encrypted_api_key=encrypted_key,
            encrypted_api_secret=encrypted_secret,
            encrypted_passphrase=encrypted_passphrase,
        )
        session.add(new_cred)
        await session.commit()
        await session.refresh(new_cred)
        return new_cred


@router.get("", response_model=List[APICredentialResponse])
async def list_credentials(
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(APICredentialModel).where(
                APICredentialModel.user_id == user_session.user_id,
                APICredentialModel.is_active == True,
            )
        )
        return result.scalars().all()
