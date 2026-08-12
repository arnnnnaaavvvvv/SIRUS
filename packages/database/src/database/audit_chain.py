import hashlib
import json
from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timezone


class AuditRecord:
    def __init__(self, sequence_id: int, tenant_id: str, payload: Dict[str, Any], prev_hash: str, timestamp: str = None):
        self.sequence_id = sequence_id
        self.tenant_id = tenant_id
        self.payload = payload
        self.prev_hash = prev_hash
        self.timestamp = timestamp or datetime.now(timezone.utc).isoformat()
        self.current_hash = self.compute_hash()

    def compute_hash(self) -> str:
        payload_str = json.dumps(self.payload, sort_keys=True)
        raw_str = f"{self.sequence_id}|{self.tenant_id}|{payload_str}|{self.prev_hash}|{self.timestamp}"
        return hashlib.sha256(raw_str.encode("utf-8")).hexdigest()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sequence_id": self.sequence_id,
            "tenant_id": self.tenant_id,
            "payload": self.payload,
            "prev_hash": self.prev_hash,
            "current_hash": self.current_hash,
            "timestamp": self.timestamp
        }


class HashChainedAuditLedger:
    """
    Immutable Hash-Chained Audit Ledger providing regulatory-grade tamper-evident trade logs.
    """

    GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000"

    def __init__(self):
        self._tenant_chains: Dict[str, List[AuditRecord]] = {}

    def append_trade_event(self, tenant_id: str, trade_payload: Dict[str, Any]) -> AuditRecord:
        """
        Appends a new trade event to the tenant's hash chain.
        """
        chain = self._tenant_chains.setdefault(tenant_id, [])
        sequence_id = len(chain) + 1
        prev_hash = chain[-1].current_hash if chain else self.GENESIS_HASH

        record = AuditRecord(
            sequence_id=sequence_id,
            tenant_id=tenant_id,
            payload=trade_payload,
            prev_hash=prev_hash
        )
        chain.append(record)
        return record

    def get_tenant_chain(self, tenant_id: str) -> List[AuditRecord]:
        return self._tenant_chains.get(tenant_id, [])

    @classmethod
    def verify_chain(cls, records: List[AuditRecord]) -> Tuple[bool, Optional[str]]:
        """
        Verifies the cryptographic integrity of a sequence of audit records.
        Returns (True, None) if intact, or (False, error_reason) if tampered.
        """
        if not records:
            return True, None

        expected_prev_hash = cls.GENESIS_HASH

        for i, rec in enumerate(records):
            if rec.prev_hash != expected_prev_hash:
                return False, f"Hash chain broken at sequence {rec.sequence_id}: prev_hash mismatch"

            recomputed = rec.compute_hash()
            if rec.current_hash != recomputed:
                return False, f"Tampered record detected at sequence {rec.sequence_id}: hash mismatch"

            expected_prev_hash = rec.current_hash

        return True, None
