from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, EmailStr


class RoleEnum(str, Enum):
    ADMIN = "admin"
    TRADER = "trader"
    AUDITOR = "auditor"


class UserStatusEnum(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    KYC_PENDING = "kyc_pending"


class BrokerEnum(str, Enum):
    ALPACA = "alpaca"
    KUCOIN = "kucoin"


class EnvironmentEnum(str, Enum):
    PAPER = "paper"
    LIVE = "live"


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderType(str, Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP_LOSS = "stop_loss"


class TimeInForce(str, Enum):
    GTC = "gtc"
    IOC = "ioc"
    FOK = "fok"


class OrderStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    PARTIALLY_FILLED = "partially_filled"
    FILLED = "filled"
    CANCELED = "canceled"
    REJECTED = "rejected"


class StrategyType(str, Enum):
    MA_CROSSOVER = "MA_CROSSOVER"
    RSI_MEAN_REVERSION = "RSI_MEAN_REVERSION"
    MOMENTUM_BREAKOUT = "MOMENTUM_BREAKOUT"


class StrategyStatus(str, Enum):
    RUNNING = "running"
    PAUSED = "paused"
    STOPPED = "stopped"
    ERROR = "error"


# User & Auth Models
class UserCreate(BaseModel):
    firebase_uid: str
    email: EmailStr
    role: RoleEnum = RoleEnum.TRADER


class UserResponse(BaseModel):
    id: UUID
    firebase_uid: str
    tenant_id: UUID
    email: str
    role: RoleEnum
    status: UserStatusEnum
    created_at: datetime

    class Config:
        from_attributes = True


class UserSession(BaseModel):
    user_id: UUID
    tenant_id: UUID
    firebase_uid: str
    email: str
    role: RoleEnum


# API Credentials Models
class APICredentialCreate(BaseModel):
    broker_name: BrokerEnum
    environment: EnvironmentEnum = EnvironmentEnum.PAPER
    api_key: str
    api_secret: str
    passphrase: Optional[str] = None


class APICredentialResponse(BaseModel):
    id: UUID
    broker_name: BrokerEnum
    environment: EnvironmentEnum
    key_version: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Market Data Models
class MarketTick(BaseModel):
    time: datetime
    symbol: str
    exchange: str
    bid_price: Decimal
    ask_price: Decimal
    last_price: Decimal
    volume: Decimal


class OHLCVCandle(BaseModel):
    time: datetime
    symbol: str
    exchange: str
    timeframe: str
    open: Decimal
    high: Decimal
    low: Decimal
    close: Decimal
    volume: Decimal


# Position & Balance Models
class PositionModel(BaseModel):
    id: Optional[UUID] = None
    user_id: UUID
    tenant_id: UUID
    broker_name: BrokerEnum
    symbol: str
    side: str
    quantity: Decimal
    avg_entry_price: Decimal
    current_price: Decimal
    unrealized_pnl: Decimal
    realized_pnl: Decimal = Decimal("0")


class BalanceModel(BaseModel):
    broker_name: BrokerEnum
    currency: str
    total_balance: Decimal
    available_balance: Decimal


# Order Request & Response Models
class OrderRequest(BaseModel):
    symbol: str
    side: OrderSide
    order_type: OrderType = OrderType.MARKET
    quantity: Decimal
    limit_price: Optional[Decimal] = None
    stop_price: Optional[Decimal] = None
    time_in_force: TimeInForce = TimeInForce.GTC
    broker_name: BrokerEnum = BrokerEnum.ALPACA
    strategy_id: Optional[UUID] = None
    idempotency_key: str = Field(default_factory=lambda: str(uuid4()))


class OrderResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    user_id: UUID
    strategy_id: Optional[UUID] = None
    client_order_id: str
    broker_order_id: Optional[str] = None
    broker_name: BrokerEnum
    symbol: str
    side: OrderSide
    order_type: OrderType
    quantity: Decimal
    filled_quantity: Decimal
    avg_fill_price: Optional[Decimal] = None
    status: OrderStatus
    error_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Strategy & Risk Configuration Models
class RiskProfile(BaseModel):
    max_position_size: Decimal = Decimal("10000")
    stop_loss_pct: Decimal = Decimal("0.02")  # 2% stop loss
    take_profit_pct: Decimal = Decimal("0.05")  # 5% take profit
    max_daily_drawdown_pct: Decimal = Decimal("0.05")
    max_user_exposure: Decimal = Decimal("50000")


class StrategyCreate(BaseModel):
    name: str
    strategy_type: StrategyType
    symbol: str
    timeframe: str = "1m"
    broker_name: BrokerEnum = BrokerEnum.ALPACA
    parameters: Dict[str, Any]
    risk_profile: RiskProfile = Field(default_factory=RiskProfile)


class StrategyResponse(BaseModel):
    id: UUID
    user_id: UUID
    tenant_id: UUID
    name: str
    strategy_type: StrategyType
    symbol: str
    timeframe: str
    broker_name: BrokerEnum
    parameters: Dict[str, Any]
    risk_profile: RiskProfile
    status: StrategyStatus
    created_at: datetime

    class Config:
        from_attributes = True


# Backtesting Models
class BacktestRequest(BaseModel):
    strategy_type: StrategyType
    symbol: str
    timeframe: str = "1m"
    start_date: datetime
    end_date: datetime
    initial_capital: Decimal = Decimal("10000")
    parameters: Dict[str, Any]
    risk_profile: RiskProfile = Field(default_factory=RiskProfile)


class TradeExecutionRecord(BaseModel):
    timestamp: datetime
    symbol: str
    side: OrderSide
    price: Decimal
    quantity: Decimal
    pnl: Decimal
    fee: Decimal


class BacktestResult(BaseModel):
    total_trades: int
    winning_trades: int
    losing_trades: int
    win_rate: float
    total_pnl: Decimal
    return_pct: float
    max_drawdown_pct: float
    sharpe_ratio: float
    trades: List[TradeExecutionRecord]
    equity_curve: List[Dict[str, Any]]
