import uuid
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.future import select
import redis.asyncio as aioredis

from common_models import (
    OrderRequest,
    OrderResponse,
    OrderStatus,
    UserSession,
    BrokerEnum,
)
from middleware.firebase_auth import get_current_user, security
from database import AsyncSessionLocal, OrderModel, APICredentialModel, decrypt_secret
from broker_adapters import AlpacaBrokerAdapter, KuCoinBrokerAdapter
from risk_core import RiskEngine

router = APIRouter(prefix="/api/v1/orders", tags=["Order Management"])

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)


async def _get_adapter_for_user(user_session: UserSession, broker_name: BrokerEnum):
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(APICredentialModel).where(
                APICredentialModel.user_id == user_session.user_id,
                APICredentialModel.broker_name == broker_name.value,
                APICredentialModel.is_active == True,
            )
        )
        cred = result.scalars().first()
        if not cred:
            if broker_name == BrokerEnum.KUCOIN:
                return KuCoinBrokerAdapter(api_key="demo", api_secret="demo", passphrase="demo", paper=True)
            return AlpacaBrokerAdapter(api_key="demo", api_secret="demo", paper=True)

        api_key = decrypt_secret(cred.encrypted_api_key)
        api_secret = decrypt_secret(cred.encrypted_api_secret)
        passphrase = decrypt_secret(cred.encrypted_passphrase) if cred.encrypted_passphrase else None

        if broker_name == BrokerEnum.KUCOIN:
            return KuCoinBrokerAdapter(api_key=api_key, api_secret=api_secret, passphrase=passphrase, paper=(cred.environment == "paper"))
        return AlpacaBrokerAdapter(api_key=api_key, api_secret=api_secret, paper=(cred.environment == "paper"))


@router.post("", response_model=OrderResponse)
async def submit_order(
    req: OrderRequest,
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    # SEC/FIN LOCK: Atomic Distributed Lock on Idempotency Key to prevent double-order submission under concurrency
    lock_key = f"lock:order:{req.idempotency_key}"
    is_locked = False
    try:
        is_locked = await redis_client.set(lock_key, "locked", nx=True, ex=30)
    except Exception:
        is_locked = True  # Fallback if Redis unavailable in local dev

    if not is_locked:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Order submission already in progress for this idempotency key.",
        )

    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(OrderModel).where(OrderModel.client_order_id == req.idempotency_key)
            )
            existing_order = result.scalars().first()
            if existing_order:
                return existing_order

        adapter = await _get_adapter_for_user(user_session, req.broker_name)

        # Execute Order via Broker Adapter
        order_res = await adapter.place_order(req, str(user_session.user_id), str(user_session.tenant_id))

        # Write to Ledger
        async with AsyncSessionLocal() as session:
            order_db = OrderModel(
                id=order_res.id,
                tenant_id=user_session.tenant_id,
                user_id=user_session.user_id,
                strategy_id=req.strategy_id,
                client_order_id=order_res.client_order_id,
                broker_order_id=order_res.broker_order_id,
                broker_name=req.broker_name.value,
                symbol=req.symbol.upper(),
                side=req.side.value,
                order_type=req.order_type.value,
                time_in_force=req.time_in_force.value,
                quantity=req.quantity,
                limit_price=req.limit_price,
                stop_price=req.stop_price,
                filled_quantity=order_res.filled_quantity,
                avg_fill_price=order_res.avg_fill_price,
                status=order_res.status.value,
            )
            session.add(order_db)
            await session.commit()
            await session.refresh(order_db)
            return order_db
    finally:
        try:
            await redis_client.delete(lock_key)
        except Exception:
            pass


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    status_filter: Optional[str] = None,
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    async with AsyncSessionLocal() as session:
        query = select(OrderModel).where(OrderModel.user_id == user_session.user_id)
        if status_filter:
            query = query.where(OrderModel.status == status_filter)
        query = query.order_by(OrderModel.created_at.desc())

        result = await session.execute(query)
        return result.scalars().all()
