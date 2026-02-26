# Kafka Events — CDSS Message Broker

---

## 1. Tổng quan

- **Broker:** Apache Kafka 3.7+
- **Cluster:** 3 brokers (production), 1 broker (dev)
- **Default replication factor:** 3 (production), 1 (dev)
- **STOMP Bridge:** notification-service publish → WebSocket `/topic/*`

---

## 2. Topics

| # | Topic | Partitions | Retention | Producer | Consumer |
|:-:|-------|:----------:|:---------:|----------|----------|
| 1 | `loan-events` | 6 | 7 ngày | loan-service | notification-service, monitoring-service |
| 2 | `scoring-results` | 3 | 7 ngày | scoring-orchestrator | loan-service, monitoring-service |
| 3 | `system-alerts` | 3 | 30 ngày | monitoring-service | notification-service |
| 4 | `ews-signals` | 3 | 30 ngày | monitoring-service | notification-service |
| 5 | `model-metrics` | 6 | 14 ngày | monitoring-service | notification-service |
| 6 | `audit-events` | 6 | 90 ngày | all services | admin-service |
| 7 | `compliance-reports` | 1 | 30 ngày | compliance-service | notification-service |

---

## 3. Payload JSON Schema

### Topic: `loan-events`

```json
{
  "eventId": "evt-uuid-001",
  "eventType": "LOAN_STATUS_CHANGED",
  "timestamp": "2026-02-26T10:30:00Z",
  "source": "loan-service",
  "payload": {
    "loanId": "LV-2435",
    "customerId": "KH001",
    "customerName": "Nguyễn Thị Hồng",
    "previousStatus": "AI_SCORING",
    "newStatus": "REVIEWING",
    "actor": "AI Engine",
    "amount": 350000000,
    "productType": "CONSUMER"
  }
}
```

**eventType values:**
- `LOAN_CREATED` — Tạo đơn vay mới
- `LOAN_SUBMITTED` — Nộp hồ sơ
- `LOAN_STATUS_CHANGED` — Thay đổi trạng thái
- `LOAN_APPROVED` — Phê duyệt
- `LOAN_REJECTED` — Từ chối
- `LOAN_DISBURSED` — Giải ngân

### Topic: `scoring-results`

```json
{
  "eventId": "evt-uuid-002",
  "eventType": "SCORING_COMPLETED",
  "timestamp": "2026-02-26T10:30:05Z",
  "source": "scoring-orchestrator",
  "payload": {
    "loanId": "LV-2435",
    "totalScore": 731,
    "riskGrade": "GOOD",
    "recommendation": "APPROVE",
    "components": [
      { "name": "Credit Risk", "source": "Seldon Core", "protocol": "gRPC", "score": 745, "latencyMs": 45 },
      { "name": "Fraud Detection", "source": "SageMaker", "protocol": "REST", "score": 890, "latencyMs": 120 }
    ],
    "totalLatencyMs": 280
  }
}
```

### Topic: `system-alerts`

```json
{
  "eventId": "evt-uuid-003",
  "eventType": "SYSTEM_ALERT",
  "timestamp": "2026-02-26T10:35:00Z",
  "source": "monitoring-service",
  "payload": {
    "alertType": "MODEL_DRIFT",
    "severity": "WARNING",
    "modelId": "M001",
    "modelName": "Credit Risk Model v3.2.1",
    "metric": "PSI",
    "value": 0.27,
    "threshold": 0.2,
    "message": "PSI=0.27 vượt ngưỡng 0.2, cần xem xét retrain"
  }
}
```

### Topic: `ews-signals`

```json
{
  "eventId": "evt-uuid-004",
  "eventType": "EWS_ALERT",
  "timestamp": "2026-02-26T09:30:00Z",
  "source": "monitoring-service",
  "payload": {
    "customerId": "KH009",
    "customerName": "Ngô Minh Kha",
    "loanId": "LV-2200",
    "riskLevel": "HIGH",
    "ewsScore": 78,
    "signals": [
      "Chậm thanh toán 5 ngày",
      "Giảm doanh số 30%",
      "Nợ quá hạn nhóm 1"
    ]
  }
}
```

### Topic: `model-metrics`

```json
{
  "eventId": "evt-uuid-005",
  "eventType": "MODEL_METRICS",
  "timestamp": "2026-02-26T10:40:00Z",
  "source": "monitoring-service",
  "payload": {
    "modelId": "M001",
    "modelName": "Credit Risk Model",
    "version": "v3.2.1",
    "metrics": {
      "auc": 0.891,
      "psi": 0.08,
      "latencyP50": 42,
      "latencyP99": 85,
      "rpm": 125,
      "errorRate": 0.001
    }
  }
}
```

### Topic: `audit-events`

```json
{
  "eventId": "evt-uuid-006",
  "eventType": "AUDIT",
  "timestamp": "2026-02-26T10:45:00Z",
  "source": "loan-service",
  "payload": {
    "userId": "U002",
    "username": "officer_binh",
    "action": "APPROVE",
    "entityType": "LOAN",
    "entityId": "LV-2435",
    "oldValue": { "status": "REVIEWING" },
    "newValue": { "status": "APPROVED", "approvedAmount": 350000000 },
    "ipAddress": "10.0.1.50"
  }
}
```

### Topic: `compliance-reports`

```json
{
  "eventId": "evt-uuid-007",
  "eventType": "REPORT_GENERATED",
  "timestamp": "2026-02-26T06:00:00Z",
  "source": "compliance-service",
  "payload": {
    "reportId": "CR001",
    "name": "Báo cáo hoạt động tín dụng T02/2026",
    "type": "BC001",
    "period": "02/2026",
    "format": "Both",
    "fileUrl": "/reports/cr001_022026.pdf",
    "fileSize": "2.4MB"
  }
}
```

---

## 4. Partition Strategy

| Topic | Partition Key | Lý do |
|-------|--------------|-------|
| `loan-events` | `loanId` | Đảm bảo thứ tự event cho cùng 1 hồ sơ |
| `scoring-results` | `loanId` | Đảm bảo kết quả scoring đúng thứ tự |
| `system-alerts` | `modelId` | Group alerts theo model |
| `ews-signals` | `customerId` | Group EWS theo khách hàng |
| `model-metrics` | `modelId` | Group theo model |
| `audit-events` | `entityType + entityId` | Group theo entity |
| `compliance-reports` | — (1 partition) | Ít event, không cần parallel |

---

## 5. Dead Letter Queue (DLQ)

Mỗi topic có DLQ tương ứng:

| Source Topic | DLQ Topic | Max Retry |
|---|---|:---:|
| `loan-events` | `loan-events.dlq` | 3 |
| `scoring-results` | `scoring-results.dlq` | 3 |
| `system-alerts` | `system-alerts.dlq` | 5 |
| `ews-signals` | `ews-signals.dlq` | 5 |
| `audit-events` | `audit-events.dlq` | 5 |

Retry strategy: **exponential backoff** (1s → 5s → 25s)

---

## 6. STOMP Bridge (Kafka → WebSocket)

`notification-service` consume Kafka rồi publish lên STOMP:

| Kafka Topic | STOMP Destination | Mô tả |
|---|---|---|
| `system-alerts` | `/topic/alerts` | Real-time alerts → Frontend |
| `model-metrics` | `/topic/model-metrics` | Model health → Monitoring dashboard |
| `loan-events` | `/topic/loan-updates` | Loan status → Loan list auto-refresh |
| `ews-signals` | `/topic/ews` | EWS → Notification center |

---

## 7. Tạo Topics (script)

```bash
# infra/kafka/topics.sh
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic loan-events        --partitions 6 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic scoring-results     --partitions 3 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic system-alerts       --partitions 3 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ews-signals         --partitions 3 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic model-metrics       --partitions 6 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic audit-events        --partitions 6 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic compliance-reports  --partitions 1 --replication-factor 1

# DLQ topics
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic loan-events.dlq       --partitions 1 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic scoring-results.dlq   --partitions 1 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic system-alerts.dlq     --partitions 1 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ews-signals.dlq       --partitions 1 --replication-factor 1
kafka-topics.sh --bootstrap-server localhost:9092 --create --topic audit-events.dlq      --partitions 1 --replication-factor 1
```
