# On-Call Operations & Incident Response Runbook

**Target Audience:** Site Reliability Engineers (SRE), Quantitative Systems Engineers, On-Call Engineers  
**Escalation Lead:** Staff Infrastructure Engineer  

---

## 1. Incident Priority Definitions

| Severity | Definition | Response SLA | Action Required |
| :--- | :--- | :--- | :--- |
| **P1 - CRITICAL** | Order execution engine failure, market data stream disconnect, or runaway strategy submitting invalid orders | **< 15 minutes** | Immediate page, execute Emergency Kill-Switch if necessary |
| **P2 - HIGH** | High Kafka consumer lag, elevated API Gateway latency (> 500ms p95), single broker adapter down | **< 30 minutes** | Investigate logs, scale workers, notify affected users |
| **P3 - MEDIUM** | Backtesting engine delays, web frontend minor UI glitches | **< 4 hours** | Standard ticket assignment |

---

## 2. Emergency Operations Playbooks

### Playbook 1: Global Platform Emergency Kill-Switch

**Scenario:** Abnormal market volatility, runaway strategy order spam, or broker API anomaly requiring an immediate halt of all live automated trading.

**Execution Steps:**

1. Trigger API Gateway global cancellation endpoint:
   ```bash
   curl -X POST https://api.platform.com/api/v1/orders/cancel-all \
     -H "Authorization: Bearer <ADMIN_ID_TOKEN>" \
     -H "Content-Type: application/json"
   ```

2. Pause all running strategy worker deployments in Kubernetes:
   ```bash
   kubectl scale deployment sirus-strategy-engine --replicas=0 -n production
   ```

3. Confirm all pending orders are canceled:
   ```bash
   kubectl logs -l app=sirus-order-executor -n production --tail=100
   ```

---

### Playbook 2: High Kafka / Redis Consumer Lag Recovery

**Scenario:** Strategy execution workers fall behind real-time tick feeds, resulting in stale signals.

**Execution Steps:**

1. Check consumer group lag in Kubernetes / KEDA:
   ```bash
   kubectl get hpa sirus-strategy-hpa -n production
   ```

2. Scale strategy worker pods up to maximum partition count:
   ```bash
   kubectl scale deployment sirus-strategy-engine --replicas=16 -n production
   ```

3. Restart worker pods if consumer group rebalance stalls:
   ```bash
   kubectl rollout restart deployment/sirus-strategy-engine -n production
   ```

---

### Playbook 3: Exchange API Credentials Decryption Failure

**Scenario:** Order Executor logs `DecryptionError` when fetching exchange API keys.

**Execution Steps:**

1. Verify HashiCorp Vault / AWS KMS connectivity:
   ```bash
   kubectl exec -it deployment/sirus-api-gateway -n production -- env | grep MASTER_ENCRYPTION_KEY
   ```

2. Verify PostgreSQL database connection pool health:
   ```bash
   kubectl exec -it deployment/postgres-timescale -n production -- psql -U postgres -d trading_db -c "SELECT count(*) FROM api_credentials WHERE is_active=true;"
   ```

---

## 3. Health Checks & Verification Endpoints

- **API Gateway Liveness:** `GET https://api.platform.com/` (Expects HTTP 200 `{ "status": "online" }`)
- **Database Connection Check:** `GET https://api.platform.com/api/v1/auth/me`
- **Redis Health:** `redis-cli -h localhost ping` (Expects `PONG`)
