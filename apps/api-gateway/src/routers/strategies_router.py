import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.future import select

from common_models import (
    StrategyCreate,
    StrategyResponse,
    StrategyStatus,
    UserSession,
)
from middleware.firebase_auth import get_current_user, security
from database import AsyncSessionLocal, StrategyModel, AuditLogModel

router = APIRouter(prefix="/api/v1/strategies", tags=["Trading Strategies"])


@router.post("", response_model=StrategyResponse)
async def create_strategy(
    req: StrategyCreate,
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    async with AsyncSessionLocal() as session:
        strategy_db = StrategyModel(
            user_id=user_session.user_id,
            tenant_id=user_session.tenant_id,
            name=req.name,
            strategy_type=req.strategy_type.value,
            symbol=req.symbol.upper(),
            timeframe=req.timeframe,
            broker_name=req.broker_name.value,
            parameters=req.parameters,
            risk_profile=req.risk_profile.dict(),
            status=StrategyStatus.STOPPED.value,
        )
        session.add(strategy_db)

        # Audit Log
        audit = AuditLogModel(
            tenant_id=user_session.tenant_id,
            user_id=user_session.user_id,
            action="CREATE_STRATEGY",
            resource=f"strategy:{req.name}",
            details=req.dict(),
        )
        session.add(audit)
        await session.commit()
        await session.refresh(strategy_db)
        return strategy_db


@router.get("", response_model=List[StrategyResponse])
async def list_strategies(
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(StrategyModel).where(StrategyModel.user_id == user_session.user_id)
        )
        return result.scalars().all()


@router.post("/{strategy_id}/start", response_model=StrategyResponse)
async def start_strategy(
    strategy_id: uuid.UUID,
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(StrategyModel).where(
                StrategyModel.id == strategy_id,
                StrategyModel.user_id == user_session.user_id,
            )
        )
        strategy = result.scalars().first()
        if not strategy:
            raise HTTPException(status_code=404, detail="Strategy not found")

        strategy.status = StrategyStatus.RUNNING.value
        session.add(
            AuditLogModel(
                tenant_id=user_session.tenant_id,
                user_id=user_session.user_id,
                action="START_STRATEGY",
                resource=f"strategy:{strategy_id}",
                details={"status": "running"},
            )
        )
        await session.commit()
        await session.refresh(strategy)
        return strategy


@router.post("/{strategy_id}/stop", response_model=StrategyResponse)
async def stop_strategy(
    strategy_id: uuid.UUID,
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(StrategyModel).where(
                StrategyModel.id == strategy_id,
                StrategyModel.user_id == user_session.user_id,
            )
        )
        strategy = result.scalars().first()
        if not strategy:
            raise HTTPException(status_code=404, detail="Strategy not found")

        strategy.status = StrategyStatus.STOPPED.value
        session.add(
            AuditLogModel(
                tenant_id=user_session.tenant_id,
                user_id=user_session.user_id,
                action="STOP_STRATEGY",
                resource=f"strategy:{strategy_id}",
                details={"status": "stopped"},
            )
        )
        await session.commit()
        await session.refresh(strategy)
        return strategy
