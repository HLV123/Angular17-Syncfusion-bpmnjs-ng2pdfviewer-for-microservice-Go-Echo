# Architecture — CDSS (Credit Decision Support System)

---

## 1. Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Angular 17+)                              │
│  Standalone Components · Signals · Lazy Loading · SCSS · NgRx              │
│                                                                             │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────────────────┐   │
│  │ HttpClient    │  │ gRPC-Web       │  │ STOMP/WebSocket (SockJS)    │   │
│  │ REST + JWT    │  │ @improbable    │  │ @stomp/rx-stomp             │   │
│  └───────┬───────┘  └───────┬────────┘  └──────────────┬───────────────┘   │
└──────────┼──────────────────┼───────────────────────────┼──────────────────┘
           │ REST/JSON        │ gRPC-Web (protobuf)       │ WebSocket
           ▼                  ▼                           ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                       ENVOY PROXY (:8443)                                    │
│            gRPC-Web transcoding · CORS · TLS termination                     │
└──────┬──────────────────┬──────────────────────┬─────────────────────────────┘
       │                  │                      │
       ▼                  ▼                      ▼
 ┌───────────┐    ┌─────────────┐    ┌──────────────────────────────────────┐
 │ API GW    │    │ Model       │    │            Apache Kafka              │
 │ Echo :8080│    │ Serving     │    │                                      │
 │           │    │             │    │  Topics:                             │
 │ Routes →  │    │ Seldon :9000│    │  loan-events · scoring-results      │
 │ 10 Go     │    │ Kubeflow    │    │  system-alerts · ews-signals        │
 │ services  │    │      :9100  │    │  model-metrics · audit-events       │
 │           │    │ SageMaker   │    │  compliance-reports                 │
 └─────┬─────┘    │ PredictionIO│    └────────────┬─────────────────────────┘
       │          └─────────────┘                 │
       ▼                                          ▼
 ┌──────────────────────────────────┐   ┌──────────────────────────────────┐
 │     GO MICROSERVICES (Echo v4)   │   │   PYTHON AI SERVICES (FastAPI)   │
 │                                  │   │                                  │
 │  customer-service      :8081     │   │  fairness-api (AIF360)    :9001  │
 │  loan-service          :8082     │   │  xai-api (AIX360)         :9002  │
 │  scoring-orchestrator  :8083     │   │  adversarial-api (ART)    :9003  │
 │  workflow-engine       :8084     │   │  automl-orchestrator      :9004  │
 │  notification-service  :8085     │   │  model-registry (ModelDB) :9005  │
 │  portfolio-service     :8086     │   │                                  │
 │  compliance-service    :8087     │   └──────────────────────────────────┘
 │  admin-service         :8088     │
 │  monitoring-service    :8089     │
 └──────────┬───────────────────────┘
            │
            ▼
 ┌──────────────────────────────────────────────────────────────────────────┐
 │                          INFRASTRUCTURE                                  │
 │                                                                          │
 │  PostgreSQL 16   Redis 7     MinIO (S3)     Keycloak 24                 │
 │  :5432           :6379       :9000          :8180                        │
 │                                                                          │
 │  Prometheus      Grafana     Jaeger                                      │
 │  :9090           :3000       :16686                                      │
 └──────────────────────────────────────────────────────────────────────────┘
```

### Quyết định thiết kế

| Quyết định | Lý do |
|---|---|
| **Go + Echo** cho tất cả microservices | Thống nhất 1 framework, Echo hỗ trợ native WebSocket + middleware mạnh |
| **Python FastAPI** cho AI services | Tận dụng ecosystem ML (AIF360, AIX360, ART, H2O) — Go không có |
| **Envoy Proxy** thay Nginx | Hỗ trợ gRPC-Web transcoding native, không cần plugin |
| **Kafka** thay RabbitMQ | Throughput cao, replay event, partition ordering cho loan pipeline |
| **PostgreSQL** thay MongoDB | ACID transactions cho tài chính, JSONB vẫn hỗ trợ semi-structured |
| **Seldon Core + Kubeflow** | Multi-model serving trên K8s, A/B testing, canary deployment |
| **NgRx** cho state management | Phức tạp đủ (notifications, loans global state) để justify NgRx |
| **Standalone Components** | Angular 17+ best practice, không cần NgModule |

---

## 2. 14 Module Nghiệp Vụ

| # | Module | Mô tả | Backend Service | Giao thức |
|:-:|--------|-------|-----------------|-----------|
| 1 | **Dashboard** | KPI tổng quan: NPL, dư nợ, pipeline, bản đồ rủi ro | portfolio-service, monitoring-service | REST |
| 2 | **CRM Khách hàng** | Hồ sơ 360°, eKYC (OCR + Face), CIC, upload tài liệu | customer-service | REST |
| 3 | **Đơn vay** | Tiếp nhận, pre-screening, quản lý pipeline (Kanban/Table) | loan-service | REST |
| 4 | **AI Scoring** | Chấm điểm tín dụng ensemble (XGBoost + TF + Fraud + Segment) | scoring-orchestrator → Seldon/Kubeflow/SageMaker | **gRPC** + REST |
| 5 | **AutoML** | Tạo job huấn luyện tự động (H2O.ai, IBM AutoAI, Watson) | automl-orchestrator | REST |
| 6 | **Model Governance** | Registry, versioning, lineage, A/B testing, deploy/rollback | model-registry (ModelDB) | REST |
| 7 | **Fairness & Bias** | Đánh giá thiên kiến (giới tính, tuổi, vùng), mitigation | fairness-api (AIF360) | REST |
| 8 | **XAI** | Giải thích AI: SHAP, LIME, DiCE counterfactual, CEM | xai-api (AIX360) | REST |
| 9 | **Adversarial** | Phát hiện tấn công (FGSM, PGD, C&W), defense, robustness test | adversarial-api (ART) | REST |
| 10 | **Monitoring & EWS** | Health check, data drift (PSI/KL/JS), EWS cảnh báo sớm | monitoring-service | REST + **STOMP** |
| 11 | **Workflow** | Phê duyệt đa cấp, ký số, BPMN diagram, SLA tracking | workflow-engine | REST |
| 12 | **Portfolio** | Danh mục tín dụng, ECL (IFRS 9), migration matrix, stress test | portfolio-service | REST |
| 13 | **Compliance** | Báo cáo NHNN (BC001–BC005), model cards, audit trail | compliance-service | REST |
| 14 | **Quản trị RBAC** | User management, 8 roles, cấu hình hệ thống, audit logs | admin-service + Keycloak | REST |

---

## 3. Stack Công Nghệ

### Frontend

| Nhóm | Công nghệ | Mục đích |
|------|-----------|----------|
| Core | Angular 17+ (Standalone, Signals) | SPA framework, lazy loading |
| UI Charts | Syncfusion Charts | Dashboard KPI |
| Data Table | ag-Grid Community | Danh sách KH, hồ sơ vay (virtualized) |
| Advanced Charts | ngx-echarts (Apache ECharts) | Phân phối điểm, trend, latency |
| Custom Charts | D3.js | SHAP bar, fairness Pareto |
| Maps | Leaflet + ngx-leaflet | Bản đồ rủi ro theo tỉnh |
| Workflow | bpmn-js | BPMN diagram phê duyệt |
| PDF | ng2-pdf-viewer | Xem tài liệu hồ sơ inline |
| Upload | ngx-dropzone | Drag & drop chứng từ |
| Image | ngx-image-cropper | Crop CCCD cho eKYC OCR |
| Dropdown | @ng-select/ng-select | Searchable select |
| i18n | @ngx-translate/core | Đa ngôn ngữ VI/EN |
| State | NgRx (Store + Effects) | Global state management |
| Real-time | @stomp/rx-stomp + SockJS | WebSocket real-time |
| gRPC | @improbable-eng/grpc-web | gRPC-Web client |

### Backend

| Nhóm | Công nghệ | Mục đích |
|------|-----------|----------|
| API Gateway | Go + Echo v4 | Routing, RBAC, rate limit, WebSocket |
| Business Services | Go + Echo v4 (×9) | CRUD, business logic, Kafka produce |
| AI/ML Services | Python + FastAPI (×5) | AIF360, AIX360, ART, H2O, ModelDB |
| Model Serving | Seldon Core, Kubeflow Serving | gRPC model inference (K8s) |
| Model Serving | SageMaker, PredictionIO | REST model inference (Cloud) |
| Database | PostgreSQL 16 | ACID, JSONB, full-text search |
| Cache | Redis 7 | Session, scoring cache, feature store |
| Object Storage | MinIO (S3-compatible) | PDF, model artifacts, datasets |
| Message Broker | Apache Kafka 3.7 | Event-driven, 7 topics, DLQ |
| Auth/SSO | Keycloak 24 | JWT, OIDC, 8 roles, realm config |
| gRPC Proxy | Envoy Proxy 1.30 | gRPC-Web transcoding, circuit breaker |
| Metrics | Prometheus + Grafana | System & model monitoring |
| Tracing | Jaeger (OTLP) | Distributed tracing |
| Orchestration | Docker + Kubernetes | Container orchestration |

---

## 4. Sơ Đồ Giao Thức

### 4.1 REST (HttpClient → API Gateway → Services)

```
Angular HttpClient
    │
    │  Authorization: Bearer <JWT>
    │  Content-Type: application/json
    ▼
API Gateway (Echo :8080)
    │
    ├── /api/v1/customers/*     → customer-service :8081
    ├── /api/v1/loans/*         → loan-service :8082
    ├── /api/v1/scoring/*       → scoring-orchestrator :8083
    ├── /api/v1/workflow/*      → workflow-engine :8084
    ├── /api/v1/notifications/* → notification-service :8085
    ├── /api/v1/portfolio/*     → portfolio-service :8086
    ├── /api/v1/compliance/*    → compliance-service :8087
    ├── /api/v1/admin/*         → admin-service :8088
    ├── /api/v1/monitoring/*    → monitoring-service :8089
    ├── /api/v1/fairness/*      → fairness-api :9001 (Python)
    ├── /api/v1/xai/*           → xai-api :9002 (Python)
    ├── /api/v1/adversarial/*   → adversarial-api :9003 (Python)
    ├── /api/v1/automl/*        → automl-orchestrator :9004 (Python)
    └── /api/v1/models/*        → model-registry :9005 (Python)
```

### 4.2 gRPC-Web (AI Scoring → Model Serving)

```
Angular (grpc.service.ts)
    │
    │  gRPC-Web (protobuf binary over HTTP/2)
    ▼
Envoy Proxy (:8443)
    │
    │  Transcode: gRPC-Web → gRPC
    ▼
┌─────────────────────────────────────────────────────┐
│  scoring-orchestrator (:8083)                        │
│                                                      │
│  Gọi song song 4 models:                            │
│  ├── gRPC → Seldon Core :9000  (XGBoost/LightGBM)  │
│  ├── gRPC → Kubeflow :9100     (TensorFlow/PyTorch) │
│  ├── REST → SageMaker          (Fraud Detection)    │
│  └── REST → PredictionIO :8000 (Segmentation)       │
│                                                      │
│  Ensemble 4 scores → totalScore + riskGrade         │
└─────────────────────────────────────────────────────┘
```

### 4.3 WebSocket/STOMP (Real-time Events)

```
Angular (stomp.service.ts)
    │
    │  STOMP over WebSocket (SockJS fallback)
    ▼
notification-service (:8085)
    │
    │  Kafka Consumer → STOMP Publisher
    ▼
┌─────────────────────────────────────────────────────┐
│  Kafka Topics            STOMP Destinations          │
│                                                      │
│  system-alerts       →   /topic/alerts               │
│  model-metrics       →   /topic/model-metrics        │
│  loan-events         →   /topic/loan-updates         │
│  ews-signals         →   /topic/ews                  │
└─────────────────────────────────────────────────────┘

Frontend auto-update khi nhận message:
  • Monitoring dashboard: latency chart cập nhật realtime
  • Notification bell: badge count tăng
  • Loan list: status tự refresh
  • EWS panel: alert mới xuất hiện
```

### 4.4 Kafka Event Flow (Service ↔ Service)

```
loan-service ──── loan-events ─────────► notification-service
                                    └──► monitoring-service

scoring-orchestrator ── scoring-results ─► loan-service
                                      └──► monitoring-service

monitoring-service ──── system-alerts ───► notification-service
                   ──── ews-signals ─────► notification-service
                   ──── model-metrics ───► notification-service

compliance-service ── compliance-reports ► notification-service

all services ───────── audit-events ─────► admin-service
```

---

## 5. Luồng Nghiệp Vụ Chính

### Luồng xử lý đơn vay (end-to-end)

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  TIẾP   │    │  PRE-    │    │   AI     │    │  THẨM   │    │  PHÊ    │    │  GIẢI   │
│  NHẬN   │───►│  SCREEN  │───►│  SCORING │───►│  ĐỊNH   │───►│  DUYỆT  │───►│  NGÂN   │
│         │    │          │    │          │    │          │    │          │    │          │
│ Analyst │    │ Auto     │    │ gRPC →   │    │ Officer  │    │ Manager  │    │ Auto     │
│ tạo đơn │    │ CIC +    │    │ Seldon + │    │ review   │    │ ký số +  │    │ chuyển   │
│ upload  │    │ blacklist│    │ Kubeflow │    │ hồ sơ    │    │ approve  │    │ khoản    │
│ docs    │    │ + tuổi   │    │+ SageMaker│   │ + XAI    │    │ hoặc     │    │          │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    │ reject   │    └──────────┘
                                                               └──────────┘
                    │               │               │               │
                    ▼               ▼               ▼               ▼
              Kafka event     Kafka event     Kafka event     Kafka event
              loan-events     scoring-results loan-events     loan-events
                    │               │               │               │
                    └───────────────┴───────────────┴───────────────┘
                                        │
                                        ▼
                              notification-service
                              → STOMP → Frontend realtime
                              → Email/SMS (production)
```
