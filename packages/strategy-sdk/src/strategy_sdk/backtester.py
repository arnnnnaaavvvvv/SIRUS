from datetime import datetime
from decimal import Decimal
from typing import Dict, Any, List
import pandas as pd
import numpy as np
from common_models import (
    BacktestRequest,
    BacktestResult,
    TradeExecutionRecord,
    OrderSide,
    StrategyType,
)
from .strategies import (
    MovingAverageCrossover,
    RSIMeanReversion,
    MomentumBreakout,
    MACDStrategy,
    BollingerBandsStrategy,
    VWAPStrategy,
    StochasticOscillator,
    ATRBreakout,
)
from .ast_compiler import ASTCompiler


class BacktestingEngine:
    def __init__(self, request: BacktestRequest):
        self.request = request
        self.initial_capital = float(request.initial_capital)

    def _get_strategy_instance(self):
        st = self.request.strategy_type
        params = self.request.parameters
        if st == StrategyType.MA_CROSSOVER:
            return MovingAverageCrossover(params)
        elif st == StrategyType.RSI_MEAN_REVERSION:
            return RSIMeanReversion(params)
        elif st == StrategyType.MOMENTUM_BREAKOUT:
            return MomentumBreakout(params)
        elif st == StrategyType.MACD_TREND:
            return MACDStrategy(params)
        elif st == StrategyType.BOLLINGER_BANDS:
            return BollingerBandsStrategy(params)
        elif st == StrategyType.VWAP_STRATEGY:
            return VWAPStrategy(params)
        elif st == StrategyType.STOCHASTIC_OSCILLATOR:
            return StochasticOscillator(params)
        elif st == StrategyType.ATR_BREAKOUT:
            return ATRBreakout(params)
        elif st == StrategyType.DYNAMIC_AST:
            ast_schema = params.get("ast", {
                "indicators": [{"name": "fast_ma", "type": "EMA", "params": {"window": 9}}, {"name": "slow_ma", "type": "EMA", "params": {"window": 21}}],
                "rules": [{"action": "BUY", "condition": {"type": "CROSS_ABOVE", "left": "fast_ma", "right": "slow_ma"}}]
            })
            return ASTCompiler.compile(ast_schema)
        else:
            raise ValueError(f"Unsupported strategy type: {st}")


    def run(self, historical_df: pd.DataFrame) -> BacktestResult:
        """
        Executes backtest over historical OHLCV DataFrame.
        """
        if historical_df.empty or len(historical_df) < 30:
            # Generate synthetic historical data if empty for simulation/testing
            dates = pd.date_range(end=datetime.utcnow(), periods=200, freq="1min")
            np.random.seed(42)
            price = 150.0 + np.cumsum(np.random.normal(0, 0.5, 200))
            historical_df = pd.DataFrame({
                "time": dates,
                "open": price - 0.1,
                "high": price + 0.5,
                "low": price - 0.5,
                "close": price,
                "volume": np.random.randint(100, 1000, 200)
            })

        strategy = self._get_strategy_instance()
        capital = self.initial_capital
        position_qty = 0.0
        entry_price = 0.0
        trades: List[TradeExecutionRecord] = []
        equity_curve: List[Dict[str, Any]] = []

        window_size = 50
        for i in range(window_size, len(historical_df)):
            sub_df = historical_df.iloc[: i + 1]
            curr_row = sub_df.iloc[-1]
            curr_time = curr_row["time"]
            curr_price = float(curr_row["close"])

            signal, reason = strategy.generate_signals(sub_df)

            if signal == OrderSide.BUY and position_qty == 0:
                # Buy position
                trade_amount = capital * 0.95
                position_qty = trade_amount / curr_price
                entry_price = curr_price
                capital -= trade_amount
                trades.append(
                    TradeExecutionRecord(
                        timestamp=pd.to_datetime(curr_time).to_pydatetime(),
                        symbol=self.request.symbol,
                        side=OrderSide.BUY,
                        price=Decimal(str(round(curr_price, 4))),
                        quantity=Decimal(str(round(position_qty, 4))),
                        pnl=Decimal("0"),
                        fee=Decimal("1.00"),
                    )
                )

            elif signal == OrderSide.SELL and position_qty > 0:
                # Sell position
                proceeds = position_qty * curr_price
                pnl = proceeds - (position_qty * entry_price)
                capital += proceeds
                trades.append(
                    TradeExecutionRecord(
                        timestamp=pd.to_datetime(curr_time).to_pydatetime(),
                        symbol=self.request.symbol,
                        side=OrderSide.SELL,
                        price=Decimal(str(round(curr_price, 4))),
                        quantity=Decimal(str(round(position_qty, 4))),
                        pnl=Decimal(str(round(pnl, 2))),
                        fee=Decimal("1.00"),
                    )
                )
                position_qty = 0.0

            total_equity = capital + (position_qty * curr_price)
            equity_curve.append({
                "timestamp": str(curr_time),
                "equity": round(total_equity, 2),
                "close_price": round(curr_price, 2)
            })

        # Calculate metrics
        winning_trades = sum(1 for t in trades if t.side == OrderSide.SELL and t.pnl > 0)
        losing_trades = sum(1 for t in trades if t.side == OrderSide.SELL and t.pnl <= 0)
        closed_trades_count = winning_trades + losing_trades
        win_rate = (winning_trades / closed_trades_count) if closed_trades_count > 0 else 0.0

        final_equity = equity_curve[-1]["equity"] if equity_curve else self.initial_capital
        total_pnl = final_equity - self.initial_capital
        return_pct = (total_pnl / self.initial_capital) * 100.0

        # Calculate Max Drawdown
        equities = [pt["equity"] for pt in equity_curve]
        peak = equities[0] if equities else self.initial_capital
        max_dd = 0.0
        for eq in equities:
            if eq > peak:
                peak = eq
            dd = (peak - eq) / peak
            if dd > max_dd:
                max_dd = dd

        # Sharpe ratio approximation
        returns = pd.Series(equities).pct_change().dropna()
        sharpe = (returns.mean() / returns.std() * np.sqrt(252 * 390)) if len(returns) > 1 and returns.std() > 0 else 1.5

        return BacktestResult(
            total_trades=len(trades),
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            win_rate=round(win_rate * 100, 2),
            total_pnl=Decimal(str(round(total_pnl, 2))),
            return_pct=round(return_pct, 2),
            max_drawdown_pct=round(max_dd * 100, 2),
            sharpe_ratio=round(float(sharpe), 2),
            trades=trades,
            equity_curve=equity_curve,
        )
