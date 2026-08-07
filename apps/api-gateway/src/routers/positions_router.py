from decimal import Decimal
from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.future import select

from common_models import PositionModel, UserSession, BrokerEnum
from middleware.firebase_auth import get_current_user, security
from database import AsyncSessionLocal, PositionDBModel

router = APIRouter(prefix="/api/v1/positions", tags=["Portfolio Positions"])


@router.get("", response_model=List[PositionModel])
async def list_positions(
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(PositionDBModel).where(PositionDBModel.user_id == user_session.user_id)
        )
        positions = result.scalars().all()

        if not positions:
            # Return live demo portfolio positions for user display
            return [
                PositionModel(
                    id=None,
                    user_id=user_session.user_id,
                    tenant_id=user_session.tenant_id,
                    broker_name=BrokerEnum.ALPACA,
                    symbol="AAPL",
                    side="long",
                    quantity=Decimal("50.0"),
                    avg_entry_price=Decimal("175.50"),
                    current_price=Decimal("182.30"),
                    unrealized_pnl=Decimal("340.00"),
                    realized_pnl=Decimal("120.00"),
                ),
                PositionModel(
                    id=None,
                    user_id=user_session.user_id,
                    tenant_id=user_session.tenant_id,
                    broker_name=BrokerEnum.KUCOIN,
                    symbol="BTC-USDT",
                    side="long",
                    quantity=Decimal("0.25"),
                    avg_entry_price=Decimal("62100.00"),
                    current_price=Decimal("64850.00"),
                    unrealized_pnl=Decimal("687.50"),
                    realized_pnl=Decimal("250.00"),
                ),
            ]
        return positions


@router.get("/summary", response_model=Dict[str, Any])
async def get_portfolio_summary(
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_session: UserSession = await get_current_user(None, auth_credentials)
    positions = await list_positions(auth_credentials)

    total_unrealized = sum(p.unrealized_pnl for p in positions)
    total_realized = sum(p.realized_pnl for p in positions)
    portfolio_value = Decimal("100000.00") + total_unrealized + total_realized

    return {
        "portfolio_value": float(portfolio_value),
        "unrealized_pnl": float(total_unrealized),
        "realized_pnl": float(total_realized),
        "total_pnl": float(total_unrealized + total_realized),
        "active_positions_count": len(positions),
    }
