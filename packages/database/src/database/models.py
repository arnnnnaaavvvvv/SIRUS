import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    Numeric,
    Integer,
    ForeignKey,
    JSON,
    Index,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class UserModel(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(128), nullable=False, unique=True, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, default=uuid.uuid4, index=True)
    email = Column(String(255), nullable=False, unique=True)
    role = Column(String(32), nullable=False, default="trader")
    status = Column(String(32), nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    credentials = relationship("APICredentialModel", back_populates="user", cascade="all, delete-orphan")
    strategies = relationship("StrategyModel", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("OrderModel", back_populates="user")


class APICredentialModel(Base):
    __tablename__ = "api_credentials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    broker_name = Column(String(64), nullable=False)
    environment = Column(String(32), nullable=False, default="paper")
    encrypted_api_key = Column(String, nullable=False)
    encrypted_api_secret = Column(String, nullable=False)
    encrypted_passphrase = Column(String, nullable=True)
    key_version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserModel", back_populates="credentials")

    __table_args__ = (
        UniqueConstraint("user_id", "broker_name", "environment", name="uq_user_broker_env"),
    )


class StrategyModel(Base):
    __tablename__ = "strategies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    strategy_type = Column(String(64), nullable=False)
    symbol = Column(String(32), nullable=False)
    timeframe = Column(String(16), nullable=False, default="1m")
    broker_name = Column(String(64), nullable=False)
    parameters = Column(JSON, nullable=False)
    risk_profile = Column(JSON, nullable=False)
    status = Column(String(32), nullable=False, default="stopped")
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserModel", back_populates="strategies")
    orders = relationship("OrderModel", back_populates="strategy")


class OrderModel(Base):
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id", ondelete="SET NULL"), nullable=True)
    client_order_id = Column(String(128), nullable=False, unique=True, index=True)
    broker_order_id = Column(String(128), nullable=True)
    broker_name = Column(String(64), nullable=False)
    symbol = Column(String(32), nullable=False)
    side = Column(String(16), nullable=False)
    order_type = Column(String(32), nullable=False)
    time_in_force = Column(String(16), nullable=False, default="gtc")
    quantity = Column(Numeric(28, 10), nullable=False)
    limit_price = Column(Numeric(28, 10), nullable=True)
    stop_price = Column(Numeric(28, 10), nullable=True)
    filled_quantity = Column(Numeric(28, 10), nullable=False, default=0)
    avg_fill_price = Column(Numeric(28, 10), nullable=True, default=0)
    status = Column(String(32), nullable=False, default="pending", index=True)
    error_code = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("UserModel", back_populates="orders")
    strategy = relationship("StrategyModel", back_populates="orders")


class PositionDBModel(Base):
    __tablename__ = "positions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id"), nullable=True)
    broker_name = Column(String(64), nullable=False)
    symbol = Column(String(32), nullable=False)
    side = Column(String(16), nullable=False)
    quantity = Column(Numeric(28, 10), nullable=False)
    avg_entry_price = Column(Numeric(28, 10), nullable=False)
    current_price = Column(Numeric(28, 10), nullable=False)
    unrealized_pnl = Column(Numeric(28, 10), nullable=False, default=0)
    realized_pnl = Column(Numeric(28, 10), nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "strategy_id", "symbol", name="uq_position_user_strategy_symbol"),
    )


class TradeHistoryModel(Base):
    __tablename__ = "trade_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    symbol = Column(String(32), nullable=False)
    side = Column(String(16), nullable=False)
    filled_price = Column(Numeric(28, 10), nullable=False)
    filled_quantity = Column(Numeric(28, 10), nullable=False)
    fee = Column(Numeric(28, 10), nullable=False, default=0)
    fee_asset = Column(String(16), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String(128), nullable=False)
    resource = Column(String(128), nullable=False)
    details = Column(JSON, nullable=False)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)


class MarketTickModel(Base):
    __tablename__ = "market_ticks"

    time = Column(DateTime(timezone=True), primary_key=True, nullable=False)
    symbol = Column(String(32), primary_key=True, nullable=False)
    exchange = Column(String(32), primary_key=True, nullable=False)
    bid_price = Column(Numeric(18, 8), nullable=False)
    ask_price = Column(Numeric(18, 8), nullable=False)
    last_price = Column(Numeric(18, 8), nullable=False)
    volume = Column(Numeric(18, 8), nullable=False)


class OHLCVCandleModel(Base):
    __tablename__ = "ohlcv_candles"

    time = Column(DateTime(timezone=True), primary_key=True, nullable=False)
    symbol = Column(String(32), primary_key=True, nullable=False)
    exchange = Column(String(32), primary_key=True, nullable=False)
    timeframe = Column(String(16), primary_key=True, nullable=False)
    open = Column(Numeric(18, 8), nullable=False)
    high = Column(Numeric(18, 8), nullable=False)
    low = Column(Numeric(18, 8), nullable=False)
    close = Column(Numeric(18, 8), nullable=False)
    volume = Column(Numeric(28, 10), nullable=False)
