<div align="center">

# ⚡ SIRUS

### **Next-Generation Automated Multi-Tenant Quantitative Trading Engine**

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TimescaleDB](https://img.shields.io/badge/TimescaleDB-PostgreSQL-FDB515?style=for-the-badge&logo=postgresql)](https://www.timescale.com/)
[![Redis](https://img.shields.io/badge/Redis-Streams-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Vercel Deployed](https://img.shields.io/badge/Vercel-Production_Live-000000?style=for-the-badge&logo=vercel)](https://web-frontend-three-gamma.vercel.app)

<br />

**[Explore Live Demo](https://web-frontend-three-gamma.vercel.app)** • **[Architecture Docs](docs/ARCHITECTURE.md)** • **[API Specification](docs/API_SPECIFICATION.md)** • **[Security Model](docs/SECURITY_AND_COMPLIANCE.md)**

</div>

---

## 🌐 Live Production Deployments

| Production Target | Domain | Status |
| :--- | :--- | :--- |
| **Primary Production App** | [https://sirus-opal.vercel.app](https://sirus-opal.vercel.app) | ![Production Live](https://img.shields.io/badge/Status-Live-emerald) |
| **Mirror Instance (2man)** | [https://sirus-2man.vercel.app](https://sirus-2man.vercel.app) | ![Production Live](https://img.shields.io/badge/Status-Live-emerald) |
| **Web Frontend Gamma** | [https://web-frontend-three-gamma.vercel.app](https://web-frontend-three-gamma.vercel.app) | ![Production Live](https://img.shields.io/badge/Status-Live-emerald) |
| **Web Frontend Nu** | [https://web-frontend-eosin-nu.vercel.app](https://web-frontend-eosin-nu.vercel.app) | ![Production Live](https://img.shields.io/badge/Status-Live-emerald) |

---

## 🚀 Overview

**SIRUS** is an enterprise-grade, high-throughput quantitative trading platform built for systematic hedge funds, proprietary trading desks, and retail quantitative traders.

Engineered with asynchronous event-driven microservices, sub-millisecond market routing, and bank-grade HSM Demat credential security, SIRUS unifies equities (Alpaca, Zerodha, Upstox, Interactive Brokers, AngelOne, Groww) and cryptocurrency derivatives (KuCoin, Binance) into a single institutional execution surface.

### 🌟 Key Capabilities

- ⚡ **Direct Market Access (DMA) & Order Routing**: Sub-millisecond order dispatch with smart order routing (SOR) across Equities, Options/Futures, and Crypto.
- 🧪 **Vectorized Backtesting Studio**: Sub-100ms multi-year strategy simulations, Monte Carlo walk-forward equity curve projections, Sharpe ratio analysis, and maximum drawdown guards.
- 🛡️ **Pre-Trade Risk Engine & Circuit Breakers**: Atomic margin validation, dynamic ATR trailing stops, position concentration caps, and tenant-isolated risk envelopes.
- 🔐 **Bank-Grade Broker Demat Vault**: AES-256-GCM envelope encryption for Kite Connect, Alpaca DMA, and exchange API keys.
- 🎨 **Paddle Billing Aesthetic Design System**: High-contrast dark theme (`#0f1515`), Inter typography, dynamic SVG glow masks, ambient glassmorphism, and responsive financial data visualizations.

---

## 🏗️ System Architecture

```mermaid
flowchart TB
    subgraph Clients["Frontend Clients"]
        WebUI["Next.js 14 Dark-Mode UI\n(Paddle Billing Theme)"]
        MobileApp["Mobile Client"]
    end

    subgraph Edge["Security & Gateway Layer"]
        FirebaseAuth["Firebase Auth Admin SDK"]
        Gateway["FastAPI Gateway Orchestrator"]
    end

    subgraph Brokerage["Direct Market Access (DMA) & Adapters"]
        Alpaca["Alpaca Markets API (US Equities)"]
        Zerodha["Zerodha Kite Connect (NSE/BSE Demat)"]
        KuCoin["KuCoin Exchange API (Crypto Spot/Perps)"]
        IBKR["Interactive Brokers TWS / Web API"]
        Upstox["Upstox Pro & AngelOne SmartAPI"]
    end

    subgraph Core["Execution & Risk Backbone"]
        RedisBus[("Redis Streams\n(Low-Latency Tick Buffer)")]
        IngestionWorker["Market Data Ingestion Service"]
        StrategyEngine["Strategy Studio & AST Engine"]
        RiskEngine["Pre-Trade Risk Engine & DD Guard"]
        OrderExecutor["Idempotent OMS/EMS Executor"]
    end

    subgraph Persistence["Storage Layer"]
        PostgreSQL[("PostgreSQL 16\n(Tenants, Accounts, Orders, HSM Vault)")]
        TimescaleDB[("TimescaleDB\n(Tick & OHLCV Hypertables)")]
    end

    WebUI -->|Bearer ID Token / WebSocket| Gateway
    Gateway -->|Verify Token| FirebaseAuth
    Gateway -->|DB Sessions & HSM Vault| PostgreSQL

    Alpaca & Zerodha & KuCoin & IBKR & Upstox -->|Live Ticker WS| IngestionWorker
    IngestionWorker -->|Publish Hot Ticks| RedisBus
    IngestionWorker -->|Persist Candles| TimescaleDB

    RedisBus -->|Stream Market Data| StrategyEngine
    StrategyEngine -->|Signal Request| RiskEngine
    RiskEngine -->|Validated Orders| OrderExecutor

    OrderExecutor -->|Idempotent Order Exec| Alpaca & Zerodha & KuCoin & IBKR
    OrderExecutor -->|Audit Log State| PostgreSQL
```

---

## 📁 Repository Structure

```
SIRUS/
├── apps/
│   ├── api-gateway/              # Main FastAPI REST & WebSocket server
│   ├── market-data-service/      # Real-time WebSocket ticker ingestion service
│   ├── order-executor/           # Async OMS execution & state reconciliation
│   └── web-frontend/             # Next.js 14 Web Dashboard (Paddle Design System)
├── packages/
│   ├── broker-adapters/          # Alpaca, Zerodha, KuCoin, IBKR concrete adapters
│   ├── common-models/            # Unified Pydantic DTOs & Decimal math schemas
│   ├── database/                 # SQLAlchemy ORM, TimescaleDB hypertables, AES vault
│   ├── risk-core/                # Pre-trade risk limit validation engine
│   └── strategy-sdk/             # Base strategy classes, built-in algos, backtesting
├── docs/                         # Detailed System Specifications
│   ├── ARCHITECTURE.md           # System Microservices & Data Pipeline Spec
│   ├── API_SPECIFICATION.md      # REST & WebSocket API Documentation
│   ├── SECURITY_AND_COMPLIANCE.md# Security Architecture & Audit Report
│   └── ON_CALL_RUNBOOK.md        # Operations & Incident Recovery Playbook
├── infrastructure/
│   ├── docker/                   # Dockerfiles for microservices
│   └── kubernetes/               # Production K8s manifests and secrets
├── tests/                        # Platform unit & integration test suites
├── docker-compose.yml            # Local development orchestration stack
└── package.json                  # Root workspace configuration
```

---

## 💻 Local Development & Quick Start

### Prerequisites
- **Docker Engine** v24.0+ & **Docker Compose** v2.20+
- **Node.js** 18+ & **npm**
- **Python** 3.11+

### 1. Clone Repository
```bash
git clone https://github.com/arnnnnaaavvvvv/SIRUS.git
cd SIRUS
```

### 2. Run Local Microservices with Docker Compose
```bash
docker-compose up --build
```

### 3. Run Web Frontend Locally
```bash
cd apps/web-frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing

Run comprehensive platform unit and integration test suites:

```bash
pytest tests/ -v
```

Tests validate:
- AES-256 envelope vault encryption and key derivation.
- Pre-trade margin limit checks, drawdown guards, and distributed Redis locks.
- Moving Average Crossover, RSI Reversion, and Donchian Breakout signal generators.
- Multi-broker adapter simulations (Alpaca, KuCoin, Zerodha Kite).
- Vectorized OHLCV backtesting engine accuracy.

---

## 📄 Documentation Directory

- [System Architecture Specification](docs/ARCHITECTURE.md)
- [REST & WebSocket API Specifications](docs/API_SPECIFICATION.md)
- [Security Model & Envelope Key Management](docs/SECURITY_AND_COMPLIANCE.md)
- [Operations & On-Call Runbook](docs/ON_CALL_RUNBOOK.md)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
