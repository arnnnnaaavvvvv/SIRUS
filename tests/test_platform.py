import pytest
from decimal import Decimal
from datetime import datetime
import pandas as pd
import asyncio

from common_models import (
    OrderRequest,
    OrderSide,
    OrderType,
    PositionModel,
    RiskProfile,
    BrokerEnum,
    StrategyType,
    BacktestRequest,
)
from database import encrypt_secret, decrypt_secret
from risk_core import RiskEngine
from strategy_sdk import MovingAverageCrossover, BacktestingEngine
from broker_adapters import AlpacaBrokerAdapter, KuCoinBrokerAdapter


def test_encryption_roundtrip():
    secret = "PK_TEST_ALPACA_API_KEY_998877"
    ciphertext = encrypt_secret(secret)
    assert ciphertext != secret
    plaintext = decrypt_secret(ciphertext)
    assert plaintext == secret


def test_risk_engine_validation():
    risk_profile = RiskProfile(
        max_position_size=Decimal("10000"),
        stop_loss_pct=Decimal("0.02"),
        max_daily_drawdown_pct=Decimal("0.05"),
        max_user_exposure=Decimal("50000"),
    )

    # Valid Order
    valid_order = OrderRequest(
        symbol="AAPL",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("10"),
        limit_price=Decimal("150.00"),
    )
    approved, reason = RiskEngine.validate_pre_trade_risk(
        valid_order, [], risk_profile, Decimal("100000")
    )
    assert approved is True
    assert reason == "Approved"

    # Excessive Size Order
    excessive_order = OrderRequest(
        symbol="AAPL",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("100"),
        limit_price=Decimal("150.00"),  # $15,000 > max $10,000
    )
    approved, reason = RiskEngine.validate_pre_trade_risk(
        excessive_order, [], risk_profile, Decimal("100000")
    )
    assert approved is False
    assert "exceeds maximum position size limit" in reason


@pytest.mark.asyncio
async def test_async_risk_engine_locking():
    risk_profile = RiskProfile(
        max_position_size=Decimal("10000"),
        stop_loss_pct=Decimal("0.02"),
        max_daily_drawdown_pct=Decimal("0.05"),
        max_user_exposure=Decimal("50000"),
    )
    order = OrderRequest(
        symbol="AAPL",
        side=OrderSide.BUY,
        order_type=OrderType.LIMIT,
        quantity=Decimal("10"),
        limit_price=Decimal("150.00"),
    )
    approved, reason = await RiskEngine.validate_pre_trade_risk_async(
        "tenant_123", order, [], risk_profile, Decimal("100000")
    )
    assert approved is True


def test_moving_average_crossover_strategy():
    strategy = MovingAverageCrossover({"short_window": 3, "long_window": 5})

    prices = [100.0, 101.0, 102.0, 103.0, 104.0, 105.0, 110.0]
    df = pd.DataFrame({
        "time": pd.date_range(end=datetime.utcnow(), periods=len(prices), freq="1min"),
        "open": prices,
        "high": prices,
        "low": prices,
        "close": prices,
        "volume": [100] * len(prices),
    })

    signal, reason = strategy.generate_signals(df)
    assert signal in (OrderSide.BUY, None)


@pytest.mark.asyncio
async def test_paper_broker_adapters():
    alpaca = AlpacaBrokerAdapter(api_key="demo", api_secret="demo", paper=True)
    balances = await alpaca.get_account_balances()
    assert len(balances) > 0
    assert balances[0].broker_name == BrokerEnum.ALPACA

    kucoin = KuCoinBrokerAdapter(api_key="demo", api_secret="demo", passphrase="demo", paper=True)
    kc_balances = await kucoin.get_account_balances()
    assert len(kc_balances) > 0
    assert kc_balances[0].broker_name == BrokerEnum.KUCOIN


def test_backtesting_engine():
    req = BacktestRequest(
        strategy_type=StrategyType.MA_CROSSOVER,
        symbol="BTC-USDT",
        timeframe="1m",
        start_date=datetime.utcnow(),
        end_date=datetime.utcnow(),
        initial_capital=Decimal("10000"),
        parameters={"short_window": 5, "long_window": 15},
    )
    engine = BacktestingEngine(req)
    result = engine.run(pd.DataFrame())
    assert result.win_rate >= 0.0
    assert result.total_trades >= 0
