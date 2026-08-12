import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from common_models import OrderSide, StrategyType

from strategy_sdk.ast_compiler import ASTCompiler, DynamicASTStrategy
from strategy_sdk.robustness_engine import WalkForwardEngine, MonteCarloSimulator
from risk_core.correlation_engine import CorrelatedRiskEngine
from database.audit_chain import HashChainedAuditLedger, AuditRecord
from anomaly_detector import MarketDataAnomalyDetector
from redis_stream_pipeline import SignalPipelineMessage


def generate_mock_ohlcv(bars: int = 150) -> pd.DataFrame:
    """Generates synthetic OHLCV price series for testing."""
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


def test_ast_compiler():
    """Tests compiling a visual JSON AST schema into an executable dynamic strategy."""
    ast_schema = {
        "indicators": [
            {"name": "short_ma", "type": "SMA", "params": {"window": 5}},
            {"name": "long_ma", "type": "SMA", "params": {"window": 15}}
        ],
        "rules": [
            {
                "action": "BUY",
                "condition": {
                    "type": "CROSS_ABOVE",
                    "left": "short_ma",
                    "right": "long_ma"
                }
            }
        ]
    }

    strategy = ASTCompiler.compile(ast_schema)
    assert isinstance(strategy, DynamicASTStrategy)

    df = generate_mock_ohlcv(50)
    signal, reason = strategy.generate_signals(df)
    assert signal in [OrderSide.BUY, OrderSide.SELL, None]
    assert isinstance(reason, str)


def test_walk_forward_and_monte_carlo():
    """Tests Walk-Forward sliding window analysis and Monte Carlo simulation."""
    df = generate_mock_ohlcv(120)
    wf_engine = WalkForwardEngine(
        strategy_type=StrategyType.MA_CROSSOVER,
        symbol="BTC/USDT",
        parameters={"short_window": 5, "long_window": 15},
        initial_capital=10000.0
    )
    wf_results = wf_engine.run_walk_forward(df, num_windows=3)

    assert "sharpe_decay_ratio" in wf_results
    assert "overfitting_risk_flag" in wf_results
    assert len(wf_results["window_details"]) == 3

    # Test Monte Carlo Simulator
    trade_returns = [0.02, -0.01, 0.035, -0.005, 0.015, -0.02, 0.04, 0.01]
    mc_sim = MonteCarloSimulator(trade_returns=trade_returns, iterations=100)
    mc_results = mc_sim.run_simulation(initial_capital=10000.0)

    assert mc_results["robustness_score"] >= 0.0
    assert "var_95_pct" in mc_results
    assert "confidence_interval_5_95" in mc_results


def test_correlated_risk_engine():
    """Tests cross-asset correlation matrix calculation and pre-trade exposure validation."""
    np.random.seed(42)
    dates = pd.date_range(end=datetime.now(timezone.utc), periods=50, freq="1h")
    # Base series
    base_returns = np.random.normal(0.001, 0.02, 50)
    btc = 100.0 * np.cumprod(1 + base_returns)
    eth = 10.0 * np.cumprod(1 + base_returns * 0.95 + np.random.normal(0, 0.001, 50))  # Strongly correlated with BTC
    gold = 200.0 * np.cumprod(1 + np.random.normal(0, 0.005, 50))  # Uncorrelated

    price_df = pd.DataFrame({"BTC/USDT": btc, "ETH/USDT": eth, "GOLD": gold}, index=dates)

    risk_engine = CorrelatedRiskEngine(max_allowed_correlation=0.80)

    # Validate adding ETH when already holding BTC (should breach high correlation limit)
    current_pos = {"BTC/USDT": 5000.0}
    passed, reason, metrics = risk_engine.evaluate_proposed_trade(
        current_positions=current_pos,
        proposed_symbol="ETH/USDT",
        proposed_value=3000.0,
        price_history_df=price_df
    )

    assert passed is False
    assert "RISK_CORRELATED_EXPOSURE_BREACH" in reason

    # Validate adding GOLD (uncorrelated, should pass)
    passed_gold, reason_gold, _ = risk_engine.evaluate_proposed_trade(
        current_positions=current_pos,
        proposed_symbol="GOLD",
        proposed_value=2000.0,
        price_history_df=price_df
    )
    assert passed_gold is True


def test_immutable_audit_ledger():
    """Tests cryptographic hash chaining and tamper detection in audit logs."""
    ledger = HashChainedAuditLedger()
    tenant_id = "tenant-test-123"

    rec1 = ledger.append_trade_event(tenant_id, {"order_id": "ord-001", "side": "BUY", "price": 100.0})
    rec2 = ledger.append_trade_event(tenant_id, {"order_id": "ord-002", "side": "SELL", "price": 105.0})

    assert rec1.sequence_id == 1
    assert rec2.sequence_id == 2
    assert rec2.prev_hash == rec1.current_hash

    # Verify intact chain
    chain = ledger.get_tenant_chain(tenant_id)
    is_valid, err = HashChainedAuditLedger.verify_chain(chain)
    assert is_valid is True
    assert err is None

    # Tamper with record 1 payload
    chain[0].payload["price"] = 999.0
    is_valid_tampered, err_tampered = HashChainedAuditLedger.verify_chain(chain)
    assert is_valid_tampered is False
    assert "Tampered record detected" in err_tampered or "hash mismatch" in err_tampered


def test_market_data_anomaly_detector():
    """Tests detecting corrupted market data frames, price spikes, and crossed books."""
    detector = MarketDataAnomalyDetector(max_staleness_seconds=2.0, z_score_threshold=3.0)

    # Valid tick
    valid_tick = {"last_price": 100.0, "bid_price": 99.9, "ask_price": 100.1, "timestamp": datetime.now(timezone.utc).timestamp()}
    ok, err = detector.inspect_tick("BTC/USDT", valid_tick)
    assert ok is True
    assert err is None

    # Crossed Book Anomaly (bid > ask)
    crossed_tick = {"last_price": 100.0, "bid_price": 102.0, "ask_price": 100.0, "timestamp": datetime.now(timezone.utc).timestamp()}
    ok_crossed, err_crossed = detector.inspect_tick("BTC/USDT", crossed_tick)
    assert ok_crossed is False
    assert "CROSSED_BOOK" in err_crossed

    # Stale Tick Anomaly
    stale_tick = {"last_price": 100.0, "bid_price": 99.9, "ask_price": 100.1, "timestamp": datetime.now(timezone.utc).timestamp() - 10.0}
    ok_stale, err_stale = detector.inspect_tick("BTC/USDT", stale_tick)
    assert ok_stale is False
    assert "STALE_DATA" in err_stale


def test_redis_stream_pipeline_message():
    """Tests SignalPipelineMessage encoding and decoding."""
    payload = {"symbol": "BTC/USDT", "side": "BUY", "price": 50000.0}
    msg = SignalPipelineMessage(stream_name="stream:ticks", payload=payload)
    
    stream_dict = msg.to_stream_dict()
    assert "payload" in stream_dict
    assert "timestamp_ms" in stream_dict

    decoded = SignalPipelineMessage.from_stream_dict("stream:ticks", stream_dict)
    assert decoded.payload["symbol"] == "BTC/USDT"
    assert decoded.payload["side"] == "BUY"
