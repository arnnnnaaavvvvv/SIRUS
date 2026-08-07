# API Specification & Protocols

**API Version:** v1  
**Base URL:** `https://api.platform.com/api/v1`  
**WebSocket Base URL:** `wss://api.platform.com/ws/v1`  
**Authentication Standard:** HTTP Authorization Header with Firebase Bearer ID Token  

---

## 1. Authentication & Security Headers

All protected REST endpoints require the HTTP Authorization header:

```http
Authorization: Bearer <Firebase_ID_Token>
Content-Type: application/json
```

---

## 2. REST Endpoints Specification

### 2.1 User Profile

#### `GET /api/v1/auth/me`
Retrieves the authenticated user's profile and internal tenant metadata.

**Response (200 OK):**
```json
{
  "id": "11111111-1111-1111-1111-111111111111",
  "firebase_uid": "uid_abc123",
  "tenant_id": "22222222-2222-2222-2222-222222222222",
  "email": "trader@sirus.io",
  "role": "trader",
  "status": "active",
  "created_at": "2026-08-07T11:00:00Z"
}
```

---

### 2.2 Broker Credentials Management

#### `POST /api/v1/credentials`
Stores encrypted API key credentials for Alpaca or KuCoin.

**Request Body:**
```json
{
  "broker_name": "alpaca",
  "environment": "paper",
  "api_key": "PK_TEST_KEY_12345",
  "api_secret": "SECRET_TEST_98765",
  "passphrase": null
}
```

**Response (200 OK):**
```json
{
  "id": "33333333-3333-3333-3333-333333333333",
  "broker_name": "alpaca",
  "environment": "paper",
  "key_version": 1,
  "is_active": true,
  "created_at": "2026-08-07T11:05:00Z"
}
```

---

### 2.3 Strategy Management

#### `POST /api/v1/strategies`
Creates and registers a new quantitative trading strategy.

**Request Body:**
```json
{
  "name": "BTC Momentum Breakout",
  "strategy_type": "MOMENTUM_BREAKOUT",
  "symbol": "BTC-USDT",
  "timeframe": "1m",
  "broker_name": "kucoin",
  "parameters": {
    "lookback_period": 20
  },
  "risk_profile": {
    "max_position_size": 5000,
    "stop_loss_pct": 0.02,
    "take_profit_pct": 0.05,
    "max_daily_drawdown_pct": 0.05,
    "max_user_exposure": 25000
  }
}
```

---

### 2.4 Historical Backtest Engine

#### `POST /api/v1/backtest/run`
Executes an asynchronous strategy backtest over historical candle data.

**Request Body:**
```json
{
  "strategy_type": "MA_CROSSOVER",
  "symbol": "BTC-USDT",
  "timeframe": "1m",
  "start_date": "2026-08-01T00:00:00Z",
  "end_date": "2026-08-07T00:00:00Z",
  "initial_capital": 10000,
  "parameters": {
    "short_window": 9,
    "long_window": 21
  }
}
```

**Response (200 OK):**
```json
{
  "total_trades": 14,
  "winning_trades": 9,
  "losing_trades": 5,
  "win_rate": 64.29,
  "total_pnl": 1420.50,
  "return_pct": 14.21,
  "max_drawdown_pct": 3.82,
  "sharpe_ratio": 2.15,
  "trades": [],
  "equity_curve": []
}
```

---

### 2.5 Order Management

#### `POST /api/v1/orders`
Submits an order with client idempotency key guarantees.

**Request Body:**
```json
{
  "symbol": "AAPL",
  "side": "buy",
  "order_type": "limit",
  "quantity": 50,
  "limit_price": 180.50,
  "time_in_force": "gtc",
  "broker_name": "alpaca",
  "idempotency_key": "ord_client_uuid_12345"
}
```

---

## 3. WebSocket Streaming Specifications

### 3.1 Market Data Stream
- **URL:** `wss://api.platform.com/ws/v1/market-data?token=<Firebase_Token>`

**Sample Broadcast Frame:**
```json
{
  "event_type": "MARKET_TICK",
  "data": {
    "symbol": "BTC-USDT",
    "exchange": "KUCOIN",
    "last_price": 64850.00,
    "bid_price": 64849.50,
    "ask_price": 64850.50,
    "volume": 1.452,
    "timestamp": 1775562000.123
  }
}
```

---

## 4. API Error Codes Matrix

| HTTP Code | Error Code | Description |
| :--- | :--- | :--- |
| `401` | `UNAUTHORIZED` | Invalid, expired, or revoked Firebase ID token |
| `403` | `USER_DISABLED` | Firebase user account has been administrative disabled |
| `409` | `IDEMPOTENCY_CONFLICT` | Order placement request with identical idempotency key is already processing |
| `429` | `RATE_LIMIT_EXCEEDED` | Exceeded tenant quota of 120 requests per minute |
| `500` | `INTERNAL_ERROR` | Internal server processing error |
