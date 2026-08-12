from typing import Optional
from fastapi import APIRouter, Depends

from common_models import UserSession, UserResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from middleware.firebase_auth import get_current_user
from database import AsyncSessionLocal, UserModel
from sqlalchemy.future import select

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & Profile"])
security = HTTPBearer()



@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    auth_credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(UserModel).where(UserModel.id == user_session.user_id))
            user_db = result.scalars().first()
            if user_db:
                return user_db
    except Exception:
        pass

    return UserResponse(
        id=user_session.user_id,
        tenant_id=user_session.tenant_id,
        firebase_uid=user_session.firebase_uid,
        email=user_session.email,
        role=user_session.role.value,
        status="active",
        created_at="2026-08-12T00:00:00Z"
    )

