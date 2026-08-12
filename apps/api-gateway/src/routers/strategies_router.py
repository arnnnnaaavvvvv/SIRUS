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


@router.get("/catalog")
async def get_strategy_catalog():
    """
    Returns pre-configured quantitative strategy templates available on the platform.
    """
    return [
        {
            "strategy_type": "MA_CROSSOVER",
            "name": "Moving Average Crossover",
            "description": "Trend-following strategy that buys when a fast moving average crosses above a slow moving average.",
            "default_parameters": {"short_window": 9, "long_window": 21},
            "category": "Trend Following"
        },
        {
            "strategy_type": "RSI_MEAN_REVERSION",
            "name": "RSI Mean Reversion",
            "description": "Buys when 14-period RSI drops into oversold territory (<=30) and sells when overbought (>=70).",
            "default_parameters": {"rsi_period": 14, "oversold_threshold": 30.0, "overbought_threshold": 70.0},
            "category": "Mean Reversion"
        },
        {
            "strategy_type": "MOMENTUM_BREAKOUT",
            "name": "Donchian Momentum Breakout",
            "description": "Buys when close price breaks above highest high of N-period lookback window.",
            "default_parameters": {"lookback_period": 20},
            "category": "Breakout"
        },
        {
            "strategy_type": "MACD_TREND",
            "name": "MACD Trend Following",
            "description": "Buys when MACD Line (12, 26) crosses above Signal Line (9).",
            "default_parameters": {"fast_period": 12, "slow_period": 26, "signal_period": 9},
            "category": "Trend Following"
        },
        {
            "strategy_type": "BOLLINGER_BANDS",
            "name": "Bollinger Bands Reversion",
            "description": "Buys when price touches lower 2-sigma band and sells on upper band touch.",
            "default_parameters": {"period": 20, "std_dev": 2.0},
            "category": "Volatiliy / Mean Reversion"
        },
        {
            "strategy_type": "VWAP_STRATEGY",
            "name": "Institutional VWAP Cross",
            "description": "Tracks Volume Weighted Average Price to capture institutional accumulation trends.",
            "default_parameters": {"window": 30},
            "category": "Institutional Volume"
        },
        {
            "strategy_type": "STOCHASTIC_OSCILLATOR",
            "name": "Stochastic %K/%D Momentum",
            "description": "Trades %K and %D line crossovers in extreme oversold (<20) and overbought (>80) zones.",
            "default_parameters": {"k_period": 14, "d_period": 3, "oversold": 20.0, "overbought": 80.0},
            "category": "Momentum"
        },
        {
            "strategy_type": "ATR_BREAKOUT",
            "name": "ATR Volatility Expansion",
            "description": "Trades sharp volatility surges exceeding N * Average True Range above moving average.",
            "default_parameters": {"atr_period": 14, "atr_multiplier": 2.0},
            "category": "Volatility"
        },
        {
            "strategy_type": "DYNAMIC_AST",
            "name": "Visual No-Code AST Strategy",
            "description": "Custom visual drag-and-drop rule graph compiled dynamically into sandboxed execution code.",
            "default_parameters": {
                "ast": {
                    "indicators": [{"name": "fast_ema", "type": "EMA", "params": {"window": 9}}, {"name": "slow_ema", "type": "EMA", "params": {"window": 21}}],
                    "rules": [{"action": "BUY", "condition": {"type": "CROSS_ABOVE", "left": "fast_ema", "right": "slow_ema"}}]
                }
            },
            "category": "No-Code Custom"
        }
    ]



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
