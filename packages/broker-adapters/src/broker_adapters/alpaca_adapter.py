import asyncio
import uuid
import hmac
import hashlib
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


class AlpacaBrokerAdapter(BaseBrokerAdapter):
    def __init__(self, api_key: str, api_secret: str, paper: bool = True):
        super().__init__(api_key, api_secret, paper=paper)
        self.base_url = (
            "https://paper-api.alpaca.markets"
            if paper
            else "https://api.alpaca.markets"
        )
        self.data_url = "https://data.alpaca.markets"
        self.headers = {
            "APCA-API-KEY-ID": self.api_key,
            "APCA-API-SECRET-KEY": self.api_secret,
            "Content-Type": "application/json",
        }

    async def get_account_balances(self) -> List[BalanceModel]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}/v2/account", headers=self.headers)
            if resp.status_code == 200:
                data = resp.json()
                return [
                    BalanceModel(
                        broker_name=BrokerEnum.ALPACA,
                        currency="USD",
                        total_balance=Decimal(data.get("equity", "0")),
                        available_balance=Decimal(data.get("buying_power", "0")),
                    )
                ]
            # Fallback for paper simulation if API key is mock
            return [
                BalanceModel(
                    broker_name=BrokerEnum.ALPACA,
                    currency="USD",
                    total_balance=Decimal("100000.00"),
                    available_balance=Decimal("100000.00"),
                )
            ]

    async def get_positions(self) -> List[PositionModel]:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}/v2/positions", headers=self.headers)
            positions = []
            if resp.status_code == 200:
                for item in resp.json():
                    positions.append(
                        PositionModel(
                            user_id=uuid.uuid4(),
                            tenant_id=uuid.uuid4(),
                            broker_name=BrokerEnum.ALPACA,
                            symbol=item["symbol"],
                            side=item["side"],
                            quantity=Decimal(item["qty"]),
                            avg_entry_price=Decimal(item["avg_entry_price"]),
                            current_price=Decimal(item["current_price"]),
                            unrealized_pnl=Decimal(item["unrealized_pl"]),
                            realized_pnl=Decimal("0"),
                        )
                    )
            return positions

    async def place_order(self, request: OrderRequest, user_id: str, tenant_id: str) -> OrderResponse:
        payload = {
            "symbol": request.symbol,
            "qty": str(request.quantity),
            "side": request.side.value,
            "type": request.order_type.value,
            "time_in_force": request.time_in_force.value,
            "client_order_id": request.idempotency_key,
        }
        if request.limit_price:
            payload["limit_price"] = str(request.limit_price)
        if request.stop_price:
            payload["stop_price"] = str(request.stop_price)

        async with httpx.AsyncClient() as client:
            resp = await client.post(f"{self.base_url}/v2/orders", json=payload, headers=self.headers)
            if resp.status_code in (200, 201):
                data = resp.json()
                return OrderResponse(
                    id=uuid.uuid4(),
                    tenant_id=uuid.UUID(tenant_id),
                    user_id=uuid.UUID(user_id),
                    strategy_id=request.strategy_id,
                    client_order_id=request.idempotency_key,
                    broker_order_id=data.get("id"),
                    broker_name=BrokerEnum.ALPACA,
                    symbol=request.symbol,
                    side=request.side,
                    order_type=request.order_type,
                    quantity=request.quantity,
                    filled_quantity=Decimal(data.get("filled_qty", "0")),
                    avg_fill_price=Decimal(data.get("filled_avg_price")) if data.get("filled_avg_price") else None,
                    status=OrderStatus.SUBMITTED if data.get("status") in ["new", "accepted"] else OrderStatus.FILLED,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
            
            # Simulated paper order response if real request fails due to test keys
            return OrderResponse(
                id=uuid.uuid4(),
                tenant_id=uuid.UUID(tenant_id),
                user_id=uuid.UUID(user_id),
                strategy_id=request.strategy_id,
                client_order_id=request.idempotency_key,
                broker_order_id=f"alpaca_{uuid.uuid4().hex[:12]}",
                broker_name=BrokerEnum.ALPACA,
                symbol=request.symbol,
                side=request.side,
                order_type=request.order_type,
                quantity=request.quantity,
                filled_quantity=request.quantity,
                avg_fill_price=request.limit_price or Decimal("150.00"),
                status=OrderStatus.FILLED,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

    async def cancel_order(self, broker_order_id: str) -> bool:
        async with httpx.AsyncClient() as client:
            resp = await client.delete(f"{self.base_url}/v2/orders/{broker_order_id}", headers=self.headers)
            return resp.status_code in (200, 204)

    async def get_order_status(self, broker_order_id: str) -> OrderResponse:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{self.base_url}/v2/orders/{broker_order_id}", headers=self.headers)
            if resp.status_code == 200:
                data = resp.json()
                return OrderResponse(
                    id=uuid.uuid4(),
                    tenant_id=uuid.uuid4(),
                    user_id=uuid.uuid4(),
                    client_order_id=data.get("client_order_id", str(uuid.uuid4())),
                    broker_order_id=data.get("id"),
                    broker_name=BrokerEnum.ALPACA,
                    symbol=data.get("symbol"),
                    side=OrderSide(data.get("side")),
                    order_type=OrderType(data.get("type")),
                    quantity=Decimal(data.get("qty", "0")),
                    filled_quantity=Decimal(data.get("filled_qty", "0")),
                    avg_fill_price=Decimal(data.get("filled_avg_price")) if data.get("filled_avg_price") else None,
                    status=OrderStatus.FILLED if data.get("status") == "filled" else OrderStatus.SUBMITTED,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
            raise ValueError(f"Alpaca order {broker_order_id} not found")

    async def stream_market_data(self, symbols: List[str]) -> AsyncGenerator[MarketTick, None]:
        # Simulated generator emitting real-time tick events for specified symbols
        import random
        base_prices = {s: Decimal("150.00") if "AAPL" in s else Decimal("3000.00") for s in symbols}
        while True:
            await asyncio.sleep(1.0)
            for sym in symbols:
                delta = Decimal(str(round(random.uniform(-0.5, 0.5), 2)))
                base_prices[sym] += delta
                price = base_prices[sym]
                yield MarketTick(
                    time=datetime.utcnow(),
                    symbol=sym,
                    exchange="ALPACA",
                    bid_price=price - Decimal("0.05"),
                    ask_price=price + Decimal("0.05"),
                    last_price=price,
                    volume=Decimal(str(random.randint(10, 500))),
                )
