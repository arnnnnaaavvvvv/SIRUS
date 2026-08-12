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


class MACDStrategy(BaseStrategy):
    """
    MACD Trend Following Strategy.
    Buys when MACD Line crosses above Signal Line.
    Sells when MACD Line crosses below Signal Line.
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.fast = int(parameters.get("fast_period", 12))
        self.slow = int(parameters.get("slow_period", 26))
        self.signal = int(parameters.get("signal_period", 9))

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if len(df) < self.slow + self.signal:
            return None, "Insufficient data bars for MACD"

        df = df.copy()
        ema_fast = df["close"].ewm(span=self.fast, adjust=False).mean()
        ema_slow = df["close"].ewm(span=self.slow, adjust=False).mean()
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=self.signal, adjust=False).mean()

        prev_macd, curr_macd = macd.iloc[-2], macd.iloc[-1]
        prev_sig, curr_sig = signal_line.iloc[-2], signal_line.iloc[-1]

        if prev_macd <= prev_sig and curr_macd > curr_sig:
            return OrderSide.BUY, f"MACD_BULLISH_CROSSOVER: MACD ({curr_macd:.3f}) crossed above Signal ({curr_sig:.3f})"
        elif prev_macd >= prev_sig and curr_macd < curr_sig:
            return OrderSide.SELL, f"MACD_BEARISH_CROSSOVER: MACD ({curr_macd:.3f}) crossed below Signal ({curr_sig:.3f})"

        return None, "No MACD crossover"


class BollingerBandsStrategy(BaseStrategy):
    """
    Bollinger Bands Mean Reversion Strategy.
    Buys when price touches or drops below the lower band.
    Sells when price touches or rises above the upper band.
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.period = int(parameters.get("period", 20))
        self.std_dev = float(parameters.get("std_dev", 2.0))

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if len(df) < self.period:
            return None, "Insufficient data bars for Bollinger Bands"

        df = df.copy()
        ma = df["close"].rolling(window=self.period).mean()
        std = df["close"].rolling(window=self.period).std()
        upper_band = ma + (std * self.std_dev)
        lower_band = ma - (std * self.std_dev)

        curr_close = df["close"].iloc[-1]
        curr_upper = upper_band.iloc[-1]
        curr_lower = lower_band.iloc[-1]

        if curr_close <= curr_lower:
            return OrderSide.BUY, f"BOLLINGER_LOWER_TOUCH: Close (${curr_close:.2f}) <= Lower Band (${curr_lower:.2f})"
        elif curr_close >= curr_upper:
            return OrderSide.SELL, f"BOLLINGER_UPPER_TOUCH: Close (${curr_close:.2f}) >= Upper Band (${curr_upper:.2f})"

        return None, "Price within Bollinger Bands"


class VWAPStrategy(BaseStrategy):
    """
    Volume Weighted Average Price (VWAP) Strategy.
    Buys when price crosses above VWAP (institutional buying momentum).
    Sells when price drops below VWAP.
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.window = int(parameters.get("window", 30))

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if len(df) < self.window + 1:
            return None, "Insufficient data bars for VWAP calculation"

        df = df.copy()
        typical_price = (df["high"] + df["low"] + df["close"]) / 3
        vwap = (typical_price * df["volume"]).rolling(window=self.window).sum() / df["volume"].rolling(window=self.window).sum()

        prev_close, curr_close = df["close"].iloc[-2], df["close"].iloc[-1]
        prev_vwap, curr_vwap = vwap.iloc[-2], vwap.iloc[-1]

        if prev_close <= prev_vwap and curr_close > curr_vwap:
            return OrderSide.BUY, f"VWAP_BULLISH_CROSS: Price (${curr_close:.2f}) crossed above VWAP (${curr_vwap:.2f})"
        elif prev_close >= prev_vwap and curr_close < curr_vwap:
            return OrderSide.SELL, f"VWAP_BEARISH_CROSS: Price (${curr_close:.2f}) crossed below VWAP (${curr_vwap:.2f})"

        return None, "Price near VWAP"


class StochasticOscillator(BaseStrategy):
    """
    Stochastic Oscillator (%K and %D) Momentum Strategy.
    Buys when %K crosses above %D in oversold region (< 20).
    Sells when %K crosses below %D in overbought region (> 80).
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.k_period = int(parameters.get("k_period", 14))
        self.d_period = int(parameters.get("d_period", 3))
        self.oversold = float(parameters.get("oversold", 20.0))
        self.overbought = float(parameters.get("overbought", 80.0))

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if len(df) < self.k_period + self.d_period:
            return None, "Insufficient data bars for Stochastic Oscillator"

        df = df.copy()
        low_min = df["low"].rolling(window=self.k_period).min()
        high_max = df["high"].rolling(window=self.k_period).max()
        pct_k = 100 * ((df["close"] - low_min) / (high_max - low_min + 1e-8))
        pct_d = pct_k.rolling(window=self.d_period).mean()

        prev_k, curr_k = pct_k.iloc[-2], pct_k.iloc[-1]
        prev_d, curr_d = pct_d.iloc[-2], pct_d.iloc[-1]

        if curr_k <= self.oversold and prev_k <= prev_d and curr_k > curr_d:
            return OrderSide.BUY, f"STOCHASTIC_OVERSOLD_BUY: %K ({curr_k:.1f}) crossed above %D ({curr_d:.1f}) below {self.oversold}"
        elif curr_k >= self.overbought and prev_k >= prev_d and curr_k < curr_d:
            return OrderSide.SELL, f"STOCHASTIC_OVERBOUGHT_SELL: %K ({curr_k:.1f}) crossed below %D ({curr_d:.1f}) above {self.overbought}"

        return None, f"Stochastic %K: {curr_k:.1f}, %D: {curr_d:.1f}"


class ATRBreakout(BaseStrategy):
    """
    Average True Range (ATR) Volatility Breakout Strategy.
    Buys when price moves more than N * ATR above the trailing moving average.
    Sells when price moves more than N * ATR below the trailing moving average.
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.period = int(parameters.get("atr_period", 14))
        self.multiplier = float(parameters.get("atr_multiplier", 2.0))

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if len(df) < self.period + 1:
            return None, "Insufficient data bars for ATR Breakout"

        df = df.copy()
        high_low = df["high"] - df["low"]
        high_close = (df["high"] - df["close"].shift(1)).abs()
        low_close = (df["low"] - df["close"].shift(1)).abs()
        tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = tr.rolling(window=self.period).mean()
        ma = df["close"].rolling(window=self.period).mean()

        curr_close = df["close"].iloc[-1]
        curr_ma = ma.iloc[-1]
        curr_atr = atr.iloc[-1]

        upper_target = curr_ma + (self.multiplier * curr_atr)
        lower_target = curr_ma - (self.multiplier * curr_atr)

        if curr_close > upper_target:
            return OrderSide.BUY, f"ATR_VOLATILITY_EXPANSION_HIGH: Close (${curr_close:.2f}) > Upper ATR Band (${upper_target:.2f})"
        elif curr_close < lower_target:
            return OrderSide.SELL, f"ATR_VOLATILITY_EXPANSION_LOW: Close (${curr_close:.2f}) < Lower ATR Band (${lower_target:.2f})"

        return None, "ATR Volatility within normal bands"
