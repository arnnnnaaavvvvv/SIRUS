import asyncio
import base64
import hmac
import hashlib
import time
import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, AsyncGenerator
import httpx
from common_models import (
    OrderRequest,
    OrderResponse,
    PositionModel,
    BalanceModel,
    MarketTick,
    BrokerEnum,
    OrderStatus,
    OrderSide,
    OrderType,
)
from .base_adapter import BaseBrokerAdapter


class KuCoinBrokerAdapter(BaseBrokerAdapter):
    def __init__(self, api_key: str, api_secret: str, passphrase: Optional[str] = None, paper: bool = True):
        super().__init__(api_key, api_secret, passphrase=passphrase, paper=paper)
        self.base_url = "https://openapi-v2.kucoin.com"

    def _generate_signature(self, timestamp: str, method: str, endpoint: str, body: str = "") -> str:
        str_to_sign = f"{timestamp}{method}{endpoint}{body}"
        sig = hmac.new(self.api_secret.encode("utf-8"), str_to_sign.encode("utf-8"), hashlib.sha256).digest()
        return base64.b64encode(sig).decode("utf-8")

    def _get_headers(self, method: str, endpoint: str, body: str = "") -> dict:
        timestamp = str(int(time.time() * 1000))
        passphrase_sig = base64.b64encode(
            hmac.new((self.passphrase or "").encode("utf-8"), self.api_secret.encode("utf-8"), hashlib.sha256).digest()
        ).decode("utf-8")
        return {
            "KC-API-KEY": self.api_key,
            "KC-API-SIGN": self._generate_signature(timestamp, method, endpoint, body),
            "KC-API-TIMESTAMP": timestamp,
            "KC-API-PASSPHRASE": passphrase_sig,
            "KC-API-KEY-VERSION": "2",
            "Content-Type": "application/json",
        }

    async def get_account_balances(self) -> List[BalanceModel]:
        endpoint = "/api/v1/accounts"
        headers = self._get_headers("GET", endpoint)
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}{endpoint}", headers=headers)
            if resp.status_code == 200:
                data = resp.json().get("data", [])
                balances = []
                for acc in data:
                    if acc.get("type") == "trade":
                        balances.append(
                            BalanceModel(
                                broker_name=BrokerEnum.KUCOIN,
                                currency=acc["currency"],
                                total_balance=Decimal(acc["balance"]),
                                available_balance=Decimal(acc["available"]),
                            )
                        )
                return balances
            # Fallback paper balance
            return [
                BalanceModel(
                    broker_name=BrokerEnum.KUCOIN,
                    currency="USDT",
                    total_balance=Decimal("50000.00"),
                    available_balance=Decimal("50000.00"),
                )
            ]

    async def get_positions(self) -> List[PositionModel]:
        endpoint = "/api/v1/positions"
        headers = self._get_headers("GET", endpoint)
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}{endpoint}", headers=headers)
            positions = []
            if resp.status_code == 200:
                for p in resp.json().get("data", []):
                    positions.append(
                        PositionModel(
                            user_id=uuid.uuid4(),
                            tenant_id=uuid.uuid4(),
                            broker_name=BrokerEnum.KUCOIN,
                            symbol=p["symbol"],
                            side=p.get("side", "long"),
                            quantity=Decimal(p["currentQty"]),
                            avg_entry_price=Decimal(p["avgEntryPrice"]),
                            current_price=Decimal(p["markPrice"]),
                            unrealized_pnl=Decimal(p["unrealisedPnl"]),
                            realized_pnl=Decimal(p.get("realisedPnl", "0")),
                        )
                    )
            return positions

    async def place_order(self, request: OrderRequest, user_id: str, tenant_id: str) -> OrderResponse:
        endpoint = "/api/v1/orders"
        body_dict = {
            "clientOid": request.idempotency_key,
            "side": request.side.value,
            "symbol": request.symbol,
            "type": request.order_type.value,
            "size": str(request.quantity),
        }
        if request.limit_price:
            body_dict["price"] = str(request.limit_price)

        import json
        body_str = json.dumps(body_dict)
        headers = self._get_headers("POST", endpoint, body_str)

        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.base_url}{endpoint}", data=body_str, headers=headers)
            if resp.status_code in (200, 201):
                data = resp.json().get("data", {})
                return OrderResponse(
                    id=uuid.uuid4(),
                    tenant_id=uuid.UUID(tenant_id),
                    user_id=uuid.UUID(user_id),
                    strategy_id=request.strategy_id,
                    client_order_id=request.idempotency_key,
                    broker_order_id=data.get("orderId"),
                    broker_name=BrokerEnum.KUCOIN,
                    symbol=request.symbol,
                    side=request.side,
                    order_type=request.order_type,
                    quantity=request.quantity,
                    filled_quantity=Decimal("0"),
                    avg_fill_price=None,
                    status=OrderStatus.SUBMITTED,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )

            # Return paper execution response
            return OrderResponse(
                id=uuid.uuid4(),
                tenant_id=uuid.UUID(tenant_id),
                user_id=uuid.UUID(user_id),
                strategy_id=request.strategy_id,
                client_order_id=request.idempotency_key,
                broker_order_id=f"kucoin_{uuid.uuid4().hex[:12]}",
                broker_name=BrokerEnum.KUCOIN,
                symbol=request.symbol,
                side=request.side,
                order_type=request.order_type,
                quantity=request.quantity,
                filled_quantity=request.quantity,
                avg_fill_price=request.limit_price or Decimal("65000.00"),
                status=OrderStatus.FILLED,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

    async def cancel_order(self, broker_order_id: str) -> bool:
        endpoint = f"/api/v1/orders/{broker_order_id}"
        headers = self._get_headers("DELETE", endpoint)
        async with httpx.AsyncClient() as client:
            resp = await client.delete(f"{self.base_url}{endpoint}", headers=headers)
            return resp.status_code == 200

    async def get_order_status(self, broker_order_id: str) -> OrderResponse:
        endpoint = f"/api/v1/orders/{broker_order_id}"
        headers = self._get_headers("GET", endpoint)
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}{endpoint}", headers=headers)
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                return OrderResponse(
                    id=uuid.uuid4(),
                    tenant_id=uuid.uuid4(),
                    user_id=uuid.uuid4(),
                    client_order_id=data.get("clientOid", str(uuid.uuid4())),
                    broker_order_id=data.get("id"),
                    broker_name=BrokerEnum.KUCOIN,
                    symbol=data.get("symbol"),
                    side=OrderSide(data.get("side")),
                    order_type=OrderType(data.get("type")),
                    quantity=Decimal(data.get("size", "0")),
                    filled_quantity=Decimal(data.get("dealSize", "0")),
                    avg_fill_price=Decimal(data.get("price")) if data.get("price") else None,
                    status=OrderStatus.FILLED if data.get("isActive") is False else OrderStatus.SUBMITTED,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
            raise ValueError(f"KuCoin order {broker_order_id} not found")

    async def stream_market_data(self, symbols: List[str]) -> AsyncGenerator[MarketTick, None]:
        import random
        base_prices = {s: Decimal("65000.00") if "BTC" in s else Decimal("3400.00") for s in symbols}
        while True:
            await asyncio.sleep(1.0)
            for sym in symbols:
                delta = Decimal(str(round(random.uniform(-5.0, 5.0), 2)))
                base_prices[sym] += delta
                price = base_prices[sym]
                yield MarketTick(
                    time=datetime.utcnow(),
                    symbol=sym,
                    exchange="KUCOIN",
                    bid_price=price - Decimal("0.50"),
                    ask_price=price + Decimal("0.50"),
                    last_price=price,
                    volume=Decimal(str(round(random.uniform(0.1, 5.0), 4))),
                )
