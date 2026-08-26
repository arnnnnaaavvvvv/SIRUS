# SIRUS — System Architecture

SIRUS is a high-throughput, multi-tenant algorithmic trading and strategy simulation platform executing orders across equity and crypto markets.

```mermaid
graph LR
    User[Trader Client / Dashboard] -->|Auth & Strategy AST Config| Auth[Firebase Auth & Gateway]
    Auth --> API[FastAPI Core Orchestrator]
    
    subgraph Execution & Simulation Core
        API --> Stream[Redis Streams Event Broker]
        Stream --> Worker[Sub-100ms Execution Engine]
        API --> MonteCarlo[Monte Carlo Walk-Forward Backtester]
    end
    
    Worker -->|Order Payload| Alpaca[Alpaca Equities Broker API]
    Worker -->|Order Payload| KuCoin[KuCoin Crypto Broker API]
```

## Architectural Highlights
- **Sub-100ms Event Pipeline**: Asynchronous order dispatch and market telemetry consumption orchestrated via Redis Streams.
- **Monte Carlo Strategy Validation**: 10,000+ iteration statistical backtesting with walk-forward risk modeling.
- **Multi-Broker Isolation**: Strict tenant segregation with sandboxed credential encryption and automated circuit-breakers.
