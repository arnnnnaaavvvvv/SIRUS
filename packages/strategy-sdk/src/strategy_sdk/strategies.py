from typing import Dict, Any, Tuple, Optional
import pandas as pd
import numpy as np
from common_models import OrderSide
from .base_strategy import BaseStrategy


class MovingAverageCrossover(BaseStrategy):
    """
    Moving Average Crossover Strategy.
    Buys when Short Moving Average crosses above Long Moving Average.
    Sells when Short Moving Average crosses below Long Moving Average.
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.short_window = int(parameters.get("short_window", 9))
        self.long_window = int(parameters.get("long_window", 21))

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if len(df) < self.long_window + 1:
            return None, "Insufficient data bars"

        df = df.copy()
        df["short_ma"] = df["close"].rolling(window=self.short_window).mean()
        df["long_ma"] = df["close"].rolling(window=self.long_window).mean()

        prev_short = df["short_ma"].iloc[-2]
        prev_long = df["long_ma"].iloc[-2]
        curr_short = df["short_ma"].iloc[-1]
        curr_long = df["long_ma"].iloc[-1]

        if prev_short <= prev_long and curr_short > curr_long:
            return OrderSide.BUY, f"BULLISH_CROSSOVER: Short MA ({curr_short:.2f}) crossed above Long MA ({curr_long:.2f})"
        elif prev_short >= prev_long and curr_short < curr_long:
            return OrderSide.SELL, f"BEARISH_CROSSOVER: Short MA ({curr_short:.2f}) crossed below Long MA ({curr_long:.2f})"

        return None, "No crossover signal"


class RSIMeanReversion(BaseStrategy):
    """
    RSI Mean Reversion Strategy.
    Buys when RSI drops below oversold threshold.
    Sells when RSI rises above overbought threshold.
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.period = int(parameters.get("rsi_period", 14))
        self.oversold = float(parameters.get("oversold_threshold", 30.0))
        self.overbought = float(parameters.get("overbought_threshold", 70.0))

    def _calculate_rsi(self, series: pd.Series) -> pd.Series:
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=self.period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=self.period).mean()
        rs = gain / (loss.replace(0, np.nan))
        return 100 - (100 / (1 + rs))

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if len(df) < self.period + 1:
            return None, "Insufficient data bars for RSI calculation"

        df = df.copy()
        df["rsi"] = self._calculate_rsi(df["close"])
        curr_rsi = df["rsi"].iloc[-1]

        if curr_rsi <= self.oversold:
            return OrderSide.BUY, f"RSI_OVERSOLD: Current RSI ({curr_rsi:.2f}) <= threshold ({self.oversold})"
        elif curr_rsi >= self.overbought:
            return OrderSide.SELL, f"RSI_OVERBOUGHT: Current RSI ({curr_rsi:.2f}) >= threshold ({self.overbought})"

        return None, f"RSI Neutral ({curr_rsi:.2f})"


class MomentumBreakout(BaseStrategy):
    """
    Donchian Channel / Momentum Breakout Strategy.
    Buys when price breaks out above the highest high of the N-period window.
    Sells when price breaks down below the lowest low of the N-period window.
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.lookback = int(parameters.get("lookback_period", 20))

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if len(df) < self.lookback + 1:
            return None, "Insufficient data bars for Breakout calculation"

        df = df.copy()
        upper_channel = df["high"].iloc[-self.lookback - 1 : -1].max()
        lower_channel = df["low"].iloc[-self.lookback - 1 : -1].min()
        curr_close = df["close"].iloc[-1]

        if curr_close > upper_channel:
            return OrderSide.BUY, f"MOMENTUM_BREAKOUT_HIGH: Close (${curr_close:.2f}) broke above Donchian High (${upper_channel:.2f})"
        elif curr_close < lower_channel:
            return OrderSide.SELL, f"MOMENTUM_BREAKDOWN_LOW: Close (${curr_close:.2f}) broke below Donchian Low (${lower_channel:.2f})"

        return None, "Price within channel"
