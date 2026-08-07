from abc import ABC, abstractmethod
from typing import Dict, Any, Tuple
import pandas as pd
from common_models import OrderSide


class BaseStrategy(ABC):
    def __init__(self, parameters: Dict[str, Any]):
        self.parameters = parameters

    @abstractmethod
    def generate_signals(self, df: pd.DataFrame) -> Tuple[OrderSide, str]:
        """
        Processes historical/current OHLCV dataframe.
        Returns signal (OrderSide.BUY, OrderSide.SELL, or None) and reason string.
        DataFrame expected to have columns: ['time', 'open', 'high', 'low', 'close', 'volume']
        """
        pass
