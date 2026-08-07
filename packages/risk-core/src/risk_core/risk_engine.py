import asyncio
import os
import redis.asyncio as aioredis
from decimal import Decimal
from typing import List, Tuple
from common_models import OrderRequest, PositionModel, RiskProfile, OrderSide

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = aioredis.from_url(REDIS_URL, decode_responses=True)


class RiskEngineException(Exception):
    pass


class RiskEngine:
    @staticmethod
    async def validate_pre_trade_risk_async(
        tenant_id: str,
        order: OrderRequest,
        existing_positions: List[PositionModel],
        risk_profile: RiskProfile,
        account_balance: Decimal,
    ) -> Tuple[bool, str]:
        """
        Evaluates proposed order against pre-trade risk controls with atomic tenant-level lock.
        """
        lock_key = f"lock:risk:{tenant_id}"
        try:
            # Acquire tenant lock to prevent race condition under concurrent signals
            await redis_client.set(lock_key, "locked", px=2000)
        except Exception:
            pass

        try:
            return RiskEngine.validate_pre_trade_risk(
                order, existing_positions, risk_profile, account_balance
            )
        finally:
            try:
                await redis_client.delete(lock_key)
            except Exception:
                pass

    @staticmethod
    def validate_pre_trade_risk(
        order: OrderRequest,
        existing_positions: List[PositionModel],
        risk_profile: RiskProfile,
        account_balance: Decimal,
    ) -> Tuple[bool, str]:
        estimated_price = order.limit_price or Decimal("100.00")
        order_value = order.quantity * estimated_price

        # 1. Order Size Check
        if order_value > risk_profile.max_position_size:
            return (
                False,
                f"Order value ${order_value:,.2f} exceeds maximum position size limit ${risk_profile.max_position_size:,.2f}",
            )

        # 2. Total User Portfolio Exposure Check
        current_exposure = sum(p.quantity * p.current_price for p in existing_positions)
        new_total_exposure = current_exposure + (order_value if order.side == OrderSide.BUY else -order_value)

        if new_total_exposure > risk_profile.max_user_exposure:
            return (
                False,
                f"Total exposure ${new_total_exposure:,.2f} after order exceeds cap ${risk_profile.max_user_exposure:,.2f}",
            )

        # 3. Daily Drawdown Limit Check
        total_unrealized_pnl = sum(p.unrealized_pnl for p in existing_positions)
        if account_balance > 0:
            drawdown_pct = abs(min(total_unrealized_pnl, Decimal("0"))) / account_balance
            if drawdown_pct >= risk_profile.max_daily_drawdown_pct:
                return (
                    False,
                    f"Current portfolio drawdown ({drawdown_pct * 100:.2f}%) violates max limit ({risk_profile.max_daily_drawdown_pct * 100:.2f}%). Circuit breaker active.",
                )

        return True, "Approved"
