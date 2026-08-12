from typing import Dict, Any, List, Type, Optional
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from common_models import OrderSide, BacktestRequest, StrategyType
from .base_strategy import BaseStrategy
from .backtester import BacktestingEngine


class WalkForwardEngine:
    """
    Walk-Forward Backtesting Engine to evaluate strategy performance stability across rolling windows.
    """

    def __init__(self, strategy_type: StrategyType, symbol: str, parameters: Dict[str, Any], initial_capital: float = 10000.0):
        self.strategy_type = strategy_type
        self.symbol = symbol
        self.parameters = parameters
        self.initial_capital = initial_capital

    def run_walk_forward(self, df: pd.DataFrame, num_windows: int = 5, train_ratio: float = 0.7) -> Dict[str, Any]:
        """
        Splits historical dataframe into `num_windows` sliding windows.
        Evaluates In-Sample (IS) vs Out-of-Sample (OOS) performance metrics.
        """
        if len(df) < 100:
            raise ValueError("Insufficient data rows for Walk-Forward evaluation (minimum 100 required)")

        total_bars = len(df)
        window_size = total_bars // num_windows
        is_sharpes = []
        oos_sharpes = []
        window_results = []

        now = datetime.now(timezone.utc)

        for i in range(num_windows):
            start_idx = i * (window_size // 2)
            end_idx = min(start_idx + window_size, total_bars)
            window_df = df.iloc[start_idx:end_idx]

            split_point = int(len(window_df) * train_ratio)
            train_df = window_df.iloc[:split_point]
            test_df = window_df.iloc[split_point:]

            req_is = BacktestRequest(
                strategy_type=self.strategy_type,
                symbol=self.symbol,
                timeframe="1m",
                parameters=self.parameters,
                initial_capital=self.initial_capital,
                start_date=now,
                end_date=now
            )
            bt_is = BacktestingEngine(req_is)
            res_is = bt_is.run(train_df)

            req_oos = BacktestRequest(
                strategy_type=self.strategy_type,
                symbol=self.symbol,
                timeframe="1m",
                parameters=self.parameters,
                initial_capital=self.initial_capital,
                start_date=now,
                end_date=now
            )
            bt_oos = BacktestingEngine(req_oos)
            res_oos = bt_oos.run(test_df)

            is_sharpe = res_is.sharpe_ratio
            oos_sharpe = res_oos.sharpe_ratio

            is_sharpes.append(is_sharpe)
            oos_sharpes.append(oos_sharpe)

            window_results.append({
                "window": i + 1,
                "is_bars": len(train_df),
                "oos_bars": len(test_df),
                "is_sharpe": is_sharpe,
                "oos_sharpe": oos_sharpe,
                "is_total_return_pct": res_is.return_pct,
                "oos_total_return_pct": res_oos.return_pct,
            })

        avg_is_sharpe = float(np.mean(is_sharpes)) if is_sharpes else 0.0
        avg_oos_sharpe = float(np.mean(oos_sharpes)) if oos_sharpes else 0.0
        decay_ratio = (avg_oos_sharpe / avg_is_sharpe) if avg_is_sharpe > 0 else 0.0

        is_overfitted = decay_ratio < 0.55 or avg_oos_sharpe < 0.0

        return {
            "num_windows": num_windows,
            "avg_in_sample_sharpe": round(avg_is_sharpe, 2),
            "avg_out_of_sample_sharpe": round(avg_oos_sharpe, 2),
            "sharpe_decay_ratio": round(decay_ratio, 2),
            "overfitting_risk_flag": is_overfitted,
            "window_details": window_results
        }


class MonteCarloSimulator:
    """
    Monte Carlo Simulation Engine for strategy robustness scoring and Value at Risk (VaR) profiling.
    """

    def __init__(self, trade_returns: List[float], iterations: int = 1000, slippage_std: float = 0.001):
        self.trade_returns = trade_returns
        self.iterations = iterations
        self.slippage_std = slippage_std

    def run_simulation(self, initial_capital: float = 10000.0) -> Dict[str, Any]:
        """
        Runs Monte Carlo bootstrap simulation over trade returns with randomized slippage noise.
        """
        if not self.trade_returns:
            return {
                "robustness_score": 0.0,
                "var_95_pct": 0.0,
                "var_99_pct": 0.0,
                "max_drawdown_p95_pct": 0.0,
                "median_final_capital": initial_capital,
                "confidence_interval_5_95": [initial_capital, initial_capital]
            }

        num_trades = len(self.trade_returns)
        final_capitals = []
        max_drawdowns = []

        np.random.seed(42)  # For reproducible simulation results

        for _ in range(self.iterations):
            # Bootstrap resample trade returns
            sampled_returns = np.random.choice(self.trade_returns, size=num_trades, replace=True)
            # Add Gaussian slippage/execution noise
            slippage_noise = np.random.normal(0, self.slippage_std, size=num_trades)
            noisy_returns = sampled_returns - np.abs(slippage_noise)

            equity_curve = [initial_capital]
            for ret in noisy_returns:
                prev = equity_curve[-1]
                next_val = prev * (1 + ret)
                equity_curve.append(max(0.1, next_val))

            equity_series = pd.Series(equity_curve)
            peak = equity_series.cummax()
            dd = (equity_series - peak) / peak
            max_dd = float(dd.min())

            final_capitals.append(equity_curve[-1])
            max_drawdowns.append(abs(max_dd))

        final_capitals = np.array(final_capitals)
        max_drawdowns = np.array(max_drawdowns)

        capital_pct_changes = (final_capitals - initial_capital) / initial_capital
        var_95 = float(np.percentile(capital_pct_changes, 5))
        var_99 = float(np.percentile(capital_pct_changes, 1))
        max_dd_p95 = float(np.percentile(max_drawdowns, 95))

        # Calculate Robustness Score (0 - 100)
        positive_runs_pct = float(np.mean(final_capitals > initial_capital)) * 100
        dd_penalty = min(50, max_dd_p95 * 100)
        robustness_score = max(0.0, min(100.0, positive_runs_pct - dd_penalty))

        return {
            "iterations": self.iterations,
            "robustness_score": round(robustness_score, 1),
            "var_95_pct": round(var_95 * 100, 2),
            "var_99_pct": round(var_99 * 100, 2),
            "max_drawdown_p95_pct": round(max_dd_p95 * 100, 2),
            "median_final_capital": round(float(np.median(final_capitals)), 2),
            "confidence_interval_5_95": [
                round(float(np.percentile(final_capitals, 5)), 2),
                round(float(np.percentile(final_capitals, 95)), 2)
            ]
        }
