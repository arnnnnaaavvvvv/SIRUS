import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from common_models import OrderSide, StrategyType, BacktestRequest

from strategy_sdk.strategies import (
    MovingAverageCrossover,
    RSIMeanReversion,
    MomentumBreakout,
    MACDStrategy,
    BollingerBandsStrategy,
    VWAPStrategy,
    StochasticOscillator,
    ATRBreakout,
)
from strategy_sdk.ast_compiler import ASTCompiler
from strategy_sdk.backtester import BacktestingEngine


def generate_mock_ohlcv(bars: int = 150) -> pd.DataFrame:
    np.random.seed(42)
    dates = pd.date_range(end=datetime.now(timezone.utc), periods=bars, freq="1min")
    price = 100.0
    prices = []
    for _ in range(bars):
        price += np.random.normal(0.05, 0.5)
        prices.append(price)

    prices = np.array(prices)
    return pd.DataFrame({
        "time": dates,
        "open": prices - 0.1,
        "high": prices + 0.3,
        "low": prices - 0.3,
        "close": prices,
        "volume": np.random.randint(100, 1000, size=bars)
    })


def test_macd_strategy():
    df = generate_mock_ohlcv(100)
    strat = MACDStrategy({"fast_period": 12, "slow_period": 26, "signal_period": 9})
    signal, reason = strat.generate_signals(df)
    assert signal in [OrderSide.BUY, OrderSide.SELL, None]
    assert isinstance(reason, str)


def test_bollinger_bands_strategy():
    df = generate_mock_ohlcv(100)
    strat = BollingerBandsStrategy({"period": 20, "std_dev": 2.0})
    signal, reason = strat.generate_signals(df)
    assert signal in [OrderSide.BUY, OrderSide.SELL, None]
    assert isinstance(reason, str)


def test_vwap_strategy():
    df = generate_mock_ohlcv(100)
    strat = VWAPStrategy({"window": 30})
    signal, reason = strat.generate_signals(df)
    assert signal in [OrderSide.BUY, OrderSide.SELL, None]
    assert isinstance(reason, str)


def test_stochastic_oscillator_strategy():
    df = generate_mock_ohlcv(100)
    strat = StochasticOscillator({"k_period": 14, "d_period": 3, "oversold": 20, "overbought": 80})
    signal, reason = strat.generate_signals(df)
    assert signal in [OrderSide.BUY, OrderSide.SELL, None]
    assert isinstance(reason, str)


def test_atr_breakout_strategy():
    df = generate_mock_ohlcv(100)
    strat = ATRBreakout({"atr_period": 14, "atr_multiplier": 2.0})
    signal, reason = strat.generate_signals(df)
    assert signal in [OrderSide.BUY, OrderSide.SELL, None]
    assert isinstance(reason, str)


def test_backtest_all_strategy_types():
    df = generate_mock_ohlcv(120)
    now = datetime.now(timezone.utc)

    all_types = [
        StrategyType.MA_CROSSOVER,
        StrategyType.RSI_MEAN_REVERSION,
        StrategyType.MOMENTUM_BREAKOUT,
        StrategyType.MACD_TREND,
        StrategyType.BOLLINGER_BANDS,
        StrategyType.VWAP_STRATEGY,
        StrategyType.STOCHASTIC_OSCILLATOR,
        StrategyType.ATR_BREAKOUT,
        StrategyType.DYNAMIC_AST,
    ]

    for st in all_types:
        req = BacktestRequest(
            strategy_type=st,
            symbol="BTC/USDT",
            timeframe="1m",
            parameters={},
            initial_capital=10000.0,
            start_date=now,
            end_date=now
        )
        engine = BacktestingEngine(req)
        res = engine.run(df)
        assert res is not None
        assert hasattr(res, "total_trades")
        assert hasattr(res, "return_pct")
        assert hasattr(res, "sharpe_ratio")
