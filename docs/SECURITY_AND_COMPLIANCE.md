# Security & Compliance Architecture Specification

**Document Version:** 1.0.0  
**Target Compliance Standards:** FINRA Rule 4511, SEC Rule 17a-4, SOC2 Type II, GDPR / CCPA  

---

## 1. Identity & Role-Based Access Control (RBAC)

### 1.1 Firebase ID Token Server-Side Verification
Authentication relies on short-lived Firebase JWT ID tokens. The API Gateway validates tokens on every protected route using the Firebase Admin SDK:

```python
# Enforcement in API Gateway Middleware
decoded_token = auth.verify_id_token(token, check_revoked=True)
```

Verification validation rules:
1. **Signature Verification:** Validated against Google public X.509 certificates.
2. **Audience & Issuer Claims:** `aud` matches Firebase Project ID; `iss` matches `https://securetoken.google.com/<PROJECT_ID>`.
3. **Expiration:** `exp` claim verified against current Unix timestamp.
4. **Revocation Check:** `check_revoked=True` checks Firebase Realtime Database revocation state to instantly revoke disabled accounts.

### 1.2 Role Hierarchy Matrix

```
[ Admin ] ---> Full System Access, Tenant Management, Global Kill-Switch
    |
    +---> [ Trader ] ---> Strategy Creation, Order Placement, Credentials Entry
            |
            +---> [ Auditor ] ---> Read-Only Access to Execution Ledger & Audit Logs
```

---

## 2. Encryption at Rest & Key Management

### 2.1 AES-256-GCM Envelope Key Encryption
Exchange API Keys and Secrets are protected using AES-256-GCM envelope encryption.

```
                          Master Key (Vault / AWS KMS)
                                       |
                                       v
[ Plaintext API Key ] ---> AES-256-GCM Encryption ---> [ Encrypted Ciphertext in DB ]
```

1. **Storage:** Plaintext keys are never written to disk, database, or log outputs.
2. **Runtime Memory:** Plaintext keys exist only in worker RAM during order dispatch and are immediately garbage collected.

---

## 3. Regulatory Compliance & Audit Ledger

### 3.1 Immutable Audit Log Schema
All administrative actions, credential updates, strategy state changes, and order executions emit append-only records to `audit_logs`:

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `UUID` | Primary identifier |
| `tenant_id` | `UUID` | Bounded tenant context |
| `user_id` | `UUID` | Authenticated user |
| `action` | `VARCHAR(128)` | Categorized action (`STRATEGY_START`, `API_KEY_UPDATE`) |
| `resource` | `VARCHAR(128)` | Target resource URI |
| `details` | `JSONB` | Action metadata |
| `ip_address` | `INET` | Client IP address |
| `created_at` | `TIMESTAMPTZ` | Microsecond timestamp |

---

## 4. Financial Risk Disclosure & Compliance Disclaimer

> [!WARNING]
> **Regulatory Disclaimer:** Automated algorithmic trading involves substantial risk of financial loss. Past performance backtests are not guarantees of future live performance. Users are solely responsible for testing strategies in Paper Trading mode prior to deploying live capital.
