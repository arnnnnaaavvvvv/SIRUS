from abc import ABC, abstractmethod
from typing import List, Optional, AsyncGenerator
from common_models import (
    OrderRequest,
    OrderResponse,
    PositionModel,
    BalanceModel,
    MarketTick,
)


class BaseBrokerAdapter(ABC):
    def __init__(self, api_key: str, api_secret: str, passphrase: Optional[str] = None, paper: bool = True):
        self.api_key = api_key
        self.api_secret = api_secret
        self.passphrase = passphrase
        self.paper = paper

    @abstractmethod
    async def get_account_balances(self) -> List[BalanceModel]:
        """Fetch account balances."""
        pass

    @abstractmethod
    async def get_positions(self) -> List[PositionModel]:
        """Fetch open positions."""
        pass

    @abstractmethod
    async def place_order(self, request: OrderRequest, user_id: str, tenant_id: str) -> OrderResponse:
        """Place an order with idempotency guarantees."""
        pass

    @abstractmethod
    async def cancel_order(self, broker_order_id: str) -> bool:
        """Cancel an active order by broker order ID."""
        pass

    @abstractmethod
    async def get_order_status(self, broker_order_id: str) -> OrderResponse:
        """Retrieve current order status from broker."""
        pass

    @abstractmethod
    async def stream_market_data(self, symbols: List[str]) -> AsyncGenerator[MarketTick, None]:
        """Stream real-time market data ticks."""
        pass
