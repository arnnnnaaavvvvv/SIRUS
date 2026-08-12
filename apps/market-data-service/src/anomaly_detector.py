import time
import math
from typing import Dict, Any, Tuple, Optional, List
import numpy as np


class MarketDataAnomalyDetector:
    """
    Real-time Anomaly Detector for WebSocket and REST market data feeds.
    Detects feed corruption, stale ticks, Z-score price spikes, and invalid market conditions.
    """

    def __init__(
        self,
        max_staleness_seconds: float = 2.0,
        z_score_threshold: float = 4.5,
        window_size: int = 50
    ):
        self.max_staleness_seconds = max_staleness_seconds
        self.z_score_threshold = z_score_threshold
        self.window_size = window_size
        self._price_history: Dict[str, List[float]] = {}
        self._last_sequence_id: Dict[str, int] = {}

    def inspect_tick(self, symbol: str, tick_data: Dict[str, Any]) -> Tuple[bool, Optional[str]]:
        """
        Inspects tick payload.
        Returns (True, None) if tick is valid, or (False, anomaly_type) if corrupted/anomalous.
        """
        current_time = time.time()
        
        # 1. Invalid Field / NaN Check
        last_price = tick_data.get("last_price")
        bid_price = tick_data.get("bid_price")
        ask_price = tick_data.get("ask_price")
        timestamp = tick_data.get("timestamp")

        if last_price is None or math.isnan(last_price) or last_price <= 0:
            return False, "CORRUPTED_DATA_INVALID_LAST_PRICE"

        if bid_price is not None and ask_price is not None:
            if math.isnan(bid_price) or math.isnan(ask_price) or bid_price <= 0 or ask_price <= 0:
                return False, "CORRUPTED_DATA_INVALID_BID_ASK"
            if ask_price < bid_price:
                return False, "CORRUPTED_DATA_CROSSED_BOOK_BID_EXCEEDS_ASK"

        # 2. Staleness Check
        if timestamp:
            tick_age = current_time - float(timestamp)
            if tick_age > self.max_staleness_seconds:
                return False, f"STALE_DATA_FEED_AGE_{tick_age:.2f}S_EXCEEDS_LIMIT"

        # 3. Sequence ID Check
        seq_id = tick_data.get("sequence_id")
        if seq_id is not None:
            last_seq = self._last_sequence_id.get(symbol)
            if last_seq is not None and seq_id > last_seq + 1:
                dropped_frames = seq_id - last_seq - 1
                # Warning or halt trigger on large gaps
                if dropped_frames > 10:
                    return False, f"SEQUENCE_GAP_DROPPED_{dropped_frames}_FRAMES"
            self._last_sequence_id[symbol] = seq_id

        # 4. Z-Score Price Spike Anomaly Check
        history = self._price_history.setdefault(symbol, [])
        if len(history) >= 10:
            mean = float(np.mean(history))
            std = float(np.std(history))
            if std > 1e-6:
                z_score = abs(last_price - mean) / std
                if z_score > self.z_score_threshold:
                    return False, f"Z_SCORE_PRICE_SPIKE_Z_{z_score:.2f}_EXCEEDS_{self.z_score_threshold}"

        # Update rolling price window
        history.append(last_price)
        if len(history) > self.window_size:
            history.pop(0)

        return True, None
