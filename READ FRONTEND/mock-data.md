# Mock Data — CDSS Frontend

---

## 1. Tổng quan

Frontend chạy độc lập không cần backend nhờ 2 service:
- **MockDataService** (`mock-data.service.ts`) — Dữ liệu tĩnh
- **MockSocketService** (`mock-socket.service.ts`) — Real-time stream giả lập

---

## 2. MockDataService — 16 phương thức

| # | Method | Records | Mô tả | Mapping Backend API |
|:-:|--------|:-------:|-------|---------------------|
| 1 | `getCustomers()` | 10 | KH001–KH010, có documents | `GET /api/v1/customers` |
| 2 | `getLoans()` | 8 | LV-2435 → LV-2442, đủ status | `GET /api/v1/loans` |
| 3 | `getModels()` | 7 | M001–M007, H2O/AutoAI/Watson | `GET /api/v1/models` |
| 4 | `getAutoMLJobs()` | 4 | Running/Completed/Failed/Queued | `GET /api/v1/automl/jobs` |
| 5 | `getFairnessMetrics()` | 4 | Gender/Age/Geo/Province | `GET /api/v1/fairness/metrics` |
| 6 | `getNotifications()` | 6 | EWS/Model/Loan/Compliance/System | `GET /api/v1/notifications` |
| 7 | `getEWSAlerts()` | 4 | High/Medium risk alerts | `GET /api/v1/monitoring/ews` |
| 8 | `getPortfolioSummary()` | 1 | NPL, ECL stages, province risk | `GET /api/v1/portfolio/summary` |
| 9 | `getWorkflowTasks()` | 6 | Pipeline: Pre-screen → Disbursement | `GET /api/v1/workflow/tasks` |
| 10 | `getComplianceReports()` | 5 | BC001–BC005 | `GET /api/v1/compliance/reports` |
| 11 | `getAdversarialAttacks()` | 5 | FGSM/PGD/C&W/DeepFool | `GET /api/v1/adversarial/attacks` |
| 12 | `getDriftFeatures()` | 6 | PSI/KL/JS per feature | `GET /api/v1/monitoring/drift` |
| 13 | `getStressScenarios()` | 5 | Baseline → Extreme | `POST /api/v1/portfolio/stress-test` |
| 14 | `getModelLineage(id)` | 9 | Data → Production → Monitoring | `GET /api/v1/models/:id/lineage` |
| 15 | `getAdminUsers()` | 8 | 8 RBAC roles | `GET /api/v1/admin/users` |
| 16 | `getSLAMetrics()` | 5 | Per-stage SLA metrics | `GET /api/v1/loans/sla-metrics` |

Helper: `generateCreditScore(base, grade, rec)` → CreditScore object

---

## 3. MockSocketService — 2 stream

| Stream | Interval | Mô tả | Mapping Backend |
|--------|:--------:|-------|-----------------|
| `getAlertStream()` | 5s | SystemAlert random | Kafka `system-alerts` → STOMP `/topic/alerts` |
| `getMetricStream()` | 3s | Model metrics random | Kafka `model-metrics` → STOMP `/topic/model-metrics` |

---

## 4. StompService — 4 stream (mock fallback)

| Stream | Interval | Mô tả | STOMP Topic |
|--------|:--------:|-------|-------------|
| `getAlerts()` | 5s | → MockSocketService fallback | `/topic/alerts` |
| `getModelMetrics()` | 3s | → MockSocketService fallback | `/topic/model-metrics` |
| `getLoanUpdates()` | 20s | Loan status changes | `/topic/loan-updates` |
| `getEWSUpdates()` | 30s | EWS signals | `/topic/ews` |

---

## 5. Tài khoản demo

| Username | Password | Role | Thấy modules |
|----------|----------|------|--------------|
| `analyst_an` | `123456` | CREDIT_ANALYST | CRM, Loans, AI Scoring |
| `officer_binh` | `123456` | CREDIT_OFFICER | CRM, Loans, AI Scoring, Workflow |
| `manager_cuong` | `123456` | CREDIT_MANAGER | All trừ AutoML, Admin |
| `risk_mgr` | `123456` | RISK_MANAGER | Fairness, XAI, Adversarial, Portfolio, Monitoring |
| `ds_nguyen` | `123456` | DATA_SCIENTIST | AI Scoring, AutoML, Model Registry, Fairness, XAI, Adversarial, Monitoring |
| `compliance_01` | `123456` | COMPLIANCE_OFFICER | Fairness, XAI, Compliance |
| `admin` | `123456` | SYSTEM_ADMIN | All modules |
| `cs_giang` | `123456` | CUSTOMER_SERVICE | CRM only |

---

## 6. Chuyển Mock → Backend thật

```typescript
// Trước (mock)
this.mockData.getCustomers()

// Sau (backend)
this.http.get<Customer[]>('/api/v1/customers', {
  params: { page: '1', pageSize: '20' }
})

// Trước (mock socket)
this.mockSocket.getAlertStream()

// Sau (STOMP thật)
this.stompService.getAlerts()  // đã có sẵn, chỉ cần set connected = true
```
