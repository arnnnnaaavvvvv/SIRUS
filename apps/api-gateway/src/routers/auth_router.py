from fastapi import APIRouter, Depends
from common_models import UserSession, UserResponse
from fastapi.security import HTTPAuthorizationCredentials
from middleware.firebase_auth import get_current_user, security
from database import AsyncSessionLocal, UserModel
from sqlalchemy.future import select

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & Profile"])
security = HTTPBearer()


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserModel).where(UserModel.id == user_session.user_id))
        user_db = result.scalars().first()
        return user_db
