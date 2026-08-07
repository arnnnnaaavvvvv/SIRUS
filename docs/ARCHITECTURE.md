# System Architecture Specification

**Target Platform:** Multi-Tenant Automated Trading Platform  
**Architectural Style:** Event-Driven Microservices Architecture  
**Primary Language:** Python 3.11+ (Backend Services) / TypeScript (Next.js 14 Web Frontend)  

---

## 1. System Context & Data Flow Architecture

The platform architecture decouples real-time market data ingestion from signal generation, risk evaluation, and order execution.

```mermaid
sequenceDiagram
    autonumber
    participant Exch as Exchange (Alpaca / KuCoin)
    participant Ingest as Market Data Ingest Service
    participant Redis as Redis Hot Cache / PubSub
    participant Strategy as Strategy Execution Worker
    participant Risk as Real-Time Risk Engine
    participant OMS as Order Execution Engine
    participant DB as PostgreSQL / TimescaleDB

    Exch->>Ingest: Streaming WebSocket Market Ticks
    Ingest->>Redis: Publish Normalized Tick (channel:ticks:SYMBOL)
    Ingest->>DB: Persist OHLCV Candle to TimescaleDB
    Redis->>Strategy: Consume Real-Time Tick
    Strategy->>Strategy: Evaluate Technical Indicators (MA / RSI / Breakout)
    Strategy->>Risk: Submit Proposed Order Signal
    Risk->>Risk: Check Position Cap, Exposure, & Drawdown (Tenant Mutex Lock)
    Risk->>OMS: Approved Order Signal
    OMS->>Redis: Acquire Idempotency Lock (lock:order:CLIENT_ID)
    OMS->>Exch: Dispatch REST Order Placement
    Exch-->>OMS: Order Acknowledged / Filled
    OMS->>DB: Persist Order & Position Ledger
    OMS->>Redis: Release Idempotency Lock
```

---

## 2. Component Specifications

### 2.1 API Gateway (`apps/api-gateway`)
- **Technology:** FastAPI, Uvicorn, Pydantic, Structlog.
- **Responsibilities:**
  - Ingress point for HTTP REST requests and WebSockets.
  - Server-side Firebase ID token verification via Firebase Admin SDK with `check_revoked=True`.
  - Application of sliding-window rate limiters enforced via Redis Lua scripts.
  - Distribution of request context (`user_id`, `tenant_id`, `role`).

### 2.2 Market Data Ingestion Service (`apps/market-data-service`)
- **Technology:** Asyncio, HTTPX, Redis, TimescaleDB.
- **Responsibilities:**
  - Maintains resilient WebSocket connections to exchange venues.
  - Normalizes raw venue JSON frames into standard `MarketTick` models.
  - Broadcasts ticks to Redis channels and writes aggregated time-series candles to TimescaleDB.

### 2.3 Strategy Execution Workers (`apps/strategy-engine`)
- **Technology:** Python 3.11, Pandas, NumPy, TA-Lib.
- **Responsibilities:**
  - Subscribes to tick channels for active tenant symbols.
  - Maintains rolling indicator windows in memory.
  - Generates buy/sell signals based on strategy rules.

### 2.4 Real-Time Risk Engine (`packages/risk-core`)
- **Technology:** Python, Redis Distributed Mutex Locks.
- **Responsibilities:**
  - Pre-trade validation enforcing order size limits, portfolio exposure caps, and drawdown rules.
  - Post-trade position monitoring enforcing stop-loss, take-profit, and circuit breaker halts.

### 2.5 Order Execution Engine (`apps/order-executor`)
- **Technology:** Asyncio, Redis, Cryptography, SQLAlchemy Async.
- **Responsibilities:**
  - Translates approved signals into broker API calls.
  - Decrypts exchange keys from DB using envelope encryption.
  - Enforces client order ID idempotency and runs background reconciliation loops to synchronize order state.

---

## 3. Database Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o{ api_credentials : owns
    users ||--o{ strategies : configures
    users ||--o{ orders : places
    strategies ||--o{ orders : generates
    orders ||--o{ trade_history : produces

    users {
        uuid id PK
        string firebase_uid UK
        uuid tenant_id
        string email UK
        string role
        string status
        timestamp created_at
    }

    api_credentials {
        uuid id PK
        uuid user_id FK
        uuid tenant_id
        string broker_name
        string environment
        string encrypted_api_key
        string encrypted_api_secret
        string encrypted_passphrase
        int key_version
        boolean is_active
    }

    strategies {
        uuid id PK
        uuid user_id FK
        uuid tenant_id
        string name
        string strategy_type
        string symbol
        string timeframe
        string broker_name
        json parameters
        json risk_profile
        string status
    }

    orders {
        uuid id PK
        uuid tenant_id
        uuid user_id FK
        uuid strategy_id FK
        string client_order_id UK
        string broker_order_id
        string broker_name
        string symbol
        string side
        string order_type
        numeric quantity
        numeric limit_price
        numeric filled_quantity
        numeric avg_fill_price
        string status
    }

    trade_history {
        uuid id PK
        uuid order_id FK
        uuid user_id FK
        uuid tenant_id
        string symbol
        string side
        numeric filled_price
        numeric filled_quantity
        numeric fee
        timestamp executed_at
    }
```

---

## 4. TimescaleDB Time-Series Hypertables

### 4.1 `market_ticks`
Partitioned by `time` (7-day interval chunks) and `symbol` (8 hash partitions):
- `time`: `TIMESTAMPTZ`
- `symbol`: `VARCHAR(32)`
- `exchange`: `VARCHAR(32)`
- `bid_price`: `NUMERIC(18, 8)`
- `ask_price`: `NUMERIC(18, 8)`
- `last_price`: `NUMERIC(18, 8)`
- `volume`: `NUMERIC(18, 8)`

### 4.2 `ohlcv_candles`
Continuous aggregate hypertable generating 1-minute, 5-minute, and 1-hour candles automatically from `market_ticks`.
