import time
import json
import asyncio
from typing import Dict, Any, Optional, Callable


class SignalPipelineMessage:
    def __init__(self, stream_name: str, payload: Dict[str, Any], timestamp_ms: float = None):
        self.stream_name = stream_name
        self.payload = payload
        self.timestamp_ms = timestamp_ms or (time.time() * 1000)

    def to_stream_dict(self) -> Dict[str, str]:
        return {
            "payload": json.dumps(self.payload),
            "timestamp_ms": str(self.timestamp_ms)
        }

    @classmethod
    def from_stream_dict(cls, stream_name: str, stream_data: Dict[bytes, bytes]) -> "SignalPipelineMessage":
        payload_bytes = stream_data.get(b"payload") or stream_data.get("payload")
        timestamp_bytes = stream_data.get(b"timestamp_ms") or stream_data.get("timestamp_ms")
        
        payload = json.loads(payload_bytes) if isinstance(payload_bytes, (str, bytes)) else payload_bytes
        timestamp_ms = float(timestamp_bytes) if timestamp_bytes else time.time() * 1000
        
        return cls(stream_name=stream_name, payload=payload, timestamp_ms=timestamp_ms)


class RedisStreamPipeline:
    """
    Sub-100ms Signal & Order Pipeline using Redis Streams and Asyncio Consumer Groups.
    """

    TICK_STREAM = "stream:ticks"
    SIGNAL_STREAM = "stream:signals"
    ORDER_STREAM = "stream:orders"

    def __init__(self, redis_client: Any):
        self.redis = redis_client

    async def publish_tick(self, symbol: str, tick_data: Dict[str, Any]) -> str:
        """
        Publishes a normalized market tick to `stream:ticks`.
        """
        msg = SignalPipelineMessage(
            stream_name=self.TICK_STREAM,
            payload={"symbol": symbol, **tick_data}
        )
        msg_id = await self.redis.xadd(self.TICK_STREAM, msg.to_stream_dict())
        return msg_id

    async def publish_signal(self, tenant_id: str, strategy_id: str, symbol: str, side: str, reason: str) -> Tuple[str, float]:
        """
        Publishes a strategy signal to `stream:signals` and returns message ID + total signal latency (ms).
        """
        start_ms = time.time() * 1000
        msg = SignalPipelineMessage(
            stream_name=self.SIGNAL_STREAM,
            payload={
                "tenant_id": tenant_id,
                "strategy_id": strategy_id,
                "symbol": symbol,
                "side": side,
                "reason": reason
            },
            timestamp_ms=start_ms
        )
        msg_id = await self.redis.xadd(self.SIGNAL_STREAM, msg.to_stream_dict())
        latency_ms = (time.time() * 1000) - start_ms
        return msg_id, latency_ms

    async def publish_order(self, tenant_id: str, order_payload: Dict[str, Any]) -> Tuple[str, float]:
        """
        Publishes an approved order execution request to `stream:orders`.
        """
        start_ms = time.time() * 1000
        msg = SignalPipelineMessage(
            stream_name=self.ORDER_STREAM,
            payload={"tenant_id": tenant_id, **order_payload},
            timestamp_ms=start_ms
        )
        msg_id = await self.redis.xadd(self.ORDER_STREAM, msg.to_stream_dict())
        latency_ms = (time.time() * 1000) - start_ms
        return msg_id, latency_ms
