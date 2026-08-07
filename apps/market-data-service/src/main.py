import asyncio
import json
import os
from datetime import datetime
from decimal import Decimal
import redis.asyncio as aioredis
from broker_adapters import AlpacaBrokerAdapter, KuCoinBrokerAdapter
from database import AsyncSessionLocal, MarketTickModel

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


async def process_tick_stream(broker_adapter, symbols: list):
    redis = aioredis.from_url(REDIS_URL, decode_responses=True)
    async for tick in broker_adapter.stream_market_data(symbols):
        # 1. Update Redis Hot Cache
        cache_key = f"tick:{tick.symbol}"
        tick_data = {
            "symbol": tick.symbol,
            "exchange": tick.exchange,
            "bid": str(tick.bid_price),
            "ask": str(tick.ask_price),
            "last": str(tick.last_price),
            "volume": str(tick.volume),
            "timestamp": tick.time.isoformat(),
        }
        await redis.hset(cache_key, mapping=tick_data)
        await redis.publish(f"channel:ticks:{tick.symbol}", json.dumps(tick_data))

        # 2. Persist to TimescaleDB
        async with AsyncSessionLocal() as session:
            db_tick = MarketTickModel(
                time=tick.time,
                symbol=tick.symbol,
                exchange=tick.exchange,
                bid_price=tick.bid_price,
                ask_price=tick.ask_price,
                last_price=tick.last_price,
                volume=tick.volume,
            )
            session.add(db_tick)
            try:
                await session.commit()
            except Exception:
                await session.rollback()


async def main():
    print("[Market Data Ingestion Service] Starting real-time WebSocket market feeds...")
    alpaca_adapter = AlpacaBrokerAdapter(api_key="demo", api_secret="demo", paper=True)
    kucoin_adapter = KuCoinBrokerAdapter(api_key="demo", api_secret="demo", passphrase="demo", paper=True)

    await asyncio.gather(
        process_tick_stream(alpaca_adapter, ["AAPL", "NVDA", "TSLA"]),
        process_tick_stream(kucoin_adapter, ["BTC-USDT", "ETH-USDT"]),
    )


if __name__ == "__main__":
    asyncio.run(main())
