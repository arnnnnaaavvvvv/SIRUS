import asyncio
import json
import random
from typing import List, Dict
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from firebase_admin import auth

router = APIRouter(prefix="/ws/v1", tags=["Real-Time WebSockets"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, str] = {}  # websocket -> token

    async def connect(self, websocket: WebSocket, token: str = ""):
        await websocket.accept()
        self.active_connections[websocket] = token

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            del self.active_connections[websocket]

    async def verify_active_sessions(self):
        """
        Background task periodically checking token validity for active WebSocket feeds.
        Closes socket immediately if Firebase account is revoked or disabled.
        """
        for ws, token in list(self.active_connections.items()):
            if token and not token.startswith("mock_token_"):
                try:
                    auth.verify_id_token(token, check_revoked=True)
                except Exception:
                    # Token revoked or account disabled -> disconnect immediately
                    try:
                        await ws.close(code=4001, reason="Authentication token revoked or expired")
                    except Exception:
                        pass
                    self.disconnect(ws)


manager = ConnectionManager()


@router.websocket("/market-data")
async def market_data_websocket(websocket: WebSocket, token: str = ""):
    await manager.connect(websocket, token)
    symbols = ["AAPL", "BTC-USDT", "ETH-USDT", "NVDA", "TSLA"]
    base_prices = {"AAPL": 182.50, "BTC-USDT": 64850.00, "ETH-USDT": 3450.00, "NVDA": 125.40, "TSLA": 210.30}

    tick_count = 0
    try:
        while True:
            await asyncio.sleep(1.0)
            tick_count += 1

            # Periodically re-verify authentication token every 30 seconds
            if tick_count % 30 == 0:
                await manager.verify_active_sessions()

            sym = random.choice(symbols)
            delta = round(random.uniform(-0.5, 0.5), 2)
            base_prices[sym] = max(1.0, base_prices[sym] + delta)

            payload = {
                "event_type": "MARKET_TICK",
                "data": {
                    "symbol": sym,
                    "exchange": "ALPACA" if "USDT" not in sym else "KUCOIN",
                    "last_price": base_prices[sym],
                    "bid_price": round(base_prices[sym] - 0.05, 2),
                    "ask_price": round(base_prices[sym] + 0.05, 2),
                    "volume": random.randint(10, 500),
                    "timestamp": asyncio.get_event_loop().time(),
                },
            }
            await websocket.send_json(payload)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
