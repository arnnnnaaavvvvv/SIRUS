# SIRUS - Automated Multi-Tenant Trading Bot Platform

A production-grade, event-driven multi-tenant automated trading platform designed for high-frequency equities (via Alpaca API) and cryptocurrency (via KuCoin API) algorithmic trading. The platform incorporates low-latency market data ingestion, pluggable quantitative strategy workers, vector/event-driven backtesting, pre/post-trade risk engines, and idempotent order execution with background state reconciliation.

---

## Executive Architectural Summary

The platform uses an Event-Driven Microservices Architecture running on Kubernetes, separating concerns between streaming market ingestion, strategy evaluation, pre-trade risk validation, order execution, and user management.

```mermaid
flowchart TB
    subgraph Clients
        WebUI["Next.js 14 Frontend"]
        MobileApp["Mobile Client"]
    end

    subgraph Edge Layer
        FirebaseAuth["Firebase Auth Admin SDK"]
        Gateway["FastAPI API Gateway"]
    end

    subgraph Message Backbone
        RedisBus[("Redis Cluster / PubSub")]
    end

    subgraph Microservices
        IngestionWorker["Market Data Ingestion Service"]
        StrategyEngine["Strategy Execution Engine"]
        RiskEngine["Real-Time Risk Engine"]
        OrderExecutor["Order Execution Engine (OMS/EMS)"]
    end

    subgraph Storage Layer
        PostgreSQL[("PostgreSQL 16\n(Users, Credentials, Orders)")]
        TimescaleDB[("TimescaleDB\n(Tick & OHLCV Hypertables)")]
    end

    subgraph External Venues
        Alpaca["Alpaca Markets API (Equities)"]
        KuCoin["KuCoin Exchange API (Crypto)"]
    end

    WebUI -->|Bearer ID Token| Gateway
    Gateway -->|Verify Token| FirebaseAuth
    Gateway -->|DB Sessions| PostgreSQL

    Alpaca -->|WebSocket Ticks| IngestionWorker
    KuCoin -->|WebSocket Ticks| IngestionWorker

    IngestionWorker -->|Cache Hot Ticks| RedisBus
    IngestionWorker -->|Persist Candles| TimescaleDB

    RedisBus -->|Stream Ticks| StrategyEngine
    StrategyEngine -->|Signal Request| RiskEngine
    RiskEngine -->|Pre-Trade Validation| OrderExecutor

    OrderExecutor -->|REST API Orders| Alpaca
    OrderExecutor -->|REST API Orders| KuCoin
    OrderExecutor -->|Persist State| PostgreSQL
```

---

## Key Features

1. **Broker Integration & Unified Models:**
   - Abstract broker adapter layer supporting Alpaca API and KuCoin API.
   - Unified domain models for orders, positions, balances, ticks, and candles using Pydantic and Python Decimal math.
2. **Quantitative Strategy Engine & Backtesting:**
   - Pluggable strategy framework with built-in Moving Average Crossover, RSI Mean Reversion, and Momentum Breakout algorithms.
   - Historical OHLCV backtester producing equity curves, Sharpe ratio, win rate, and max drawdown metrics.
3. **Pre-Trade & Post-Trade Risk Management:**
   - Enforces position size caps, user portfolio exposure limits, daily drawdown limits, and volatility circuit breakers.
   - Atomic tenant locks preventing race conditions under high concurrency.
4. **Idempotent Order Execution & Reconciliation:**
   - Distributed Redis locking on `client_order_id` to eliminate double-order risk.
   - Background reconciliation daemon matching local order status against exchange ground truth.
5. **Authentication & Multi-Tenant Security:**
   - Firebase Authentication with server-side Firebase Admin SDK verification (`check_revoked=True`).
   - Bank-grade AES-256-GCM envelope key encryption for broker credentials at rest.
   - Multi-tenant tenant isolation across storage and execution paths.

---

## Repository Layout

```
SIRUS/
├── apps/
│   ├── api-gateway/              # Main FastAPI REST & WebSocket server
│   ├── market-data-service/      # Real-time WebSocket ingestion service
│   ├── order-executor/           # Async OMS execution & reconciliation service
│   └── web-frontend/             # Next.js 14 Dark-Mode Web Dashboard
├── packages/
│   ├── broker-adapters/          # Alpaca & KuCoin concrete implementations
│   ├── common-models/            # Unified Pydantic DTOs & data schemas
│   ├── database/                 # SQLAlchemy ORM, TimescaleDB hypertables, AES encryption
│   ├── risk-core/                # Pre-trade risk rule validation engine
│   └── strategy-sdk/             # Base strategy classes, built-in algos, backtesting
├── docs/                         # Detailed System Specifications
│   ├── ARCHITECTURE.md           # System Microservices & Data Pipeline Spec
│   ├── API_SPECIFICATION.md      # REST & WebSocket API Documentation
│   ├── SECURITY_AND_COMPLIANCE.md# Security Architecture & Audit Report
│   └── ON_CALL_RUNBOOK.md        # Operations & Incident Recovery Playbook
├── infrastructure/
│   ├── docker/                   # Dockerfile specs for each service
│   └── kubernetes/               # Production K8s deployments and secret specs
├── tests/                        # Platform unit & integration tests
├── docker-compose.yml            # Local development orchestration
└── pyproject.toml                # Project configurations
```

---

## Quick Start Guide

### Prerequisites
- Docker Engine v24.0+ and Docker Compose v2.20+
- Python 3.11+
- Node.js 18+ (for local frontend development)

### Local Deployment via Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/org/sirus-trading-platform.git
   cd sirus-trading-platform
   ```

2. Start the complete stack using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Service URLs:
   - **Next.js Web Dashboard:** `http://localhost:3000`
   - **FastAPI Gateway Swagger Specs:** `http://localhost:8000/docs`
   - **PostgreSQL / TimescaleDB:** `localhost:5432`
   - **Redis Cache:** `localhost:6379`

---

## Environment Variables

| Variable Name | Default Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:postgrespassword@localhost:5432/trading_db` | Connection string for PostgreSQL & TimescaleDB |
| `REDIS_URL` | `redis://localhost:6379/0` | Connection URL for Redis Cluster / Cache |
| `MASTER_ENCRYPTION_KEY` | `default-dev-secret-key-32bytes-long!!` | Master secret key used for AES-256-GCM envelope key encryption |
| `DISABLE_FIREBASE_AUTH` | `false` | Set to `true` to enable offline local development mode without Firebase |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `/etc/firebase/service-account.json` | Path to Firebase Admin SDK service account key JSON file |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Allowed CORS origins for API requests |

---

## Testing & Verification

To run platform unit and integration tests:

```bash
pytest tests/test_platform.py -v
```

Tests cover:
- AES-256 envelope encryption roundtrips.
- Pre-trade risk limit validation and atomic locks.
- Moving Average Crossover signal generation.
- Alpaca and KuCoin broker adapter paper simulation.
- Backtesting engine accuracy against historical data slices.

---

## Detailed Documentation Directory

- [System Architecture Specification](docs/ARCHITECTURE.md)
- [API Specification & Protocols](docs/API_SPECIFICATION.md)
- [Security Architecture & Audit Findings](docs/SECURITY_AND_COMPLIANCE.md)
- [Operations & On-Call Runbook](docs/ON_CALL_RUNBOOK.md)
