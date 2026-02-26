# Frontend Structure — CDSS Retail Platform

---

## 1. Cấu trúc project ban đầu (khi mở VSCode)

```
retail frontend/
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
│
└── src/
    ├── index.html
    ├── main.ts
    ├── styles.scss
    │
    ├── environments/
    │   ├── environment.ts
    │   └── environment.prod.ts
    │
    ├── assets/
    │   ├── images/
    │   │   └── logo.png
    │   └── i18n/
    │       ├── vi.json
    │       └── en.json
    │
    └── app/
        ├── app.component.ts
        ├── app.config.ts
        ├── app.routes.ts
        │
        ├── core/
        │   ├── auth/
        │   │   ├── auth.service.ts
        │   │   └── login.component.ts
        │   ├── guards/
        │   │   ├── auth.guard.ts
        │   │   └── role.guard.ts
        │   ├── interceptors/
        │   │   └── auth.interceptor.ts
        │   ├── models/
        │   │   └── data.models.ts
        │   └── services/
        │       ├── mock-data.service.ts
        │       ├── mock-socket.service.ts
        │       ├── grpc.service.ts
        │       └── stomp.service.ts
        │
        ├── shared/
        │   └── layout/
        │       └── main-layout.component.ts
        │
        ├── store/
        │   ├── app.state.ts
        │   ├── loans/
        │   │   ├── loans.actions.ts
        │   │   └── loans.reducer.ts
        │   └── notifications/
        │       └── notifications.reducer.ts
        │
        └── features/
            ├── dashboard/
            │   └── dashboard.component.ts
            ├── customer/
            │   ├── customer-list.component.ts
            │   └── customer-detail.component.ts
            ├── loan-application/
            │   ├── loan-list.component.ts
            │   ├── loan-detail.component.ts
            │   └── loan-wizard.component.ts
            ├── ai-scoring/
            │   ├── scoring-dashboard.component.ts
            │   └── scoring-result.component.ts
            ├── automl/
            │   └── automl-dashboard.component.ts
            ├── model-governance/
            │   ├── model-registry.component.ts
            │   └── model-detail.component.ts
            ├── fairness/
            │   └── fairness-dashboard.component.ts
            ├── explainability/
            │   └── explainability-dashboard.component.ts
            ├── adversarial/
            │   └── adversarial-dashboard.component.ts
            ├── compliance/
            │   └── compliance-dashboard.component.ts
            ├── portfolio/
            │   └── portfolio-dashboard.component.ts
            ├── monitoring/
            │   └── monitoring-dashboard.component.ts
            ├── workflow/
            │   └── workflow-dashboard.component.ts
            ├── notifications/
            │   └── notification-center.component.ts
            └── admin/
                ├── admin-dashboard.component.ts
                └── user-management.component.ts
```

---

## 2. Lệnh cài đặt & file được sinh thêm

### Bước 1 — Cài dependencies

```bash
npm install
```

Sau lệnh này, thư mục sau được sinh:

```
retail frontend/
├── node_modules/          ← (sinh mới, ~500MB, chứa toàn bộ packages)
│   ├── @angular/
│   └── ... (các dependencies khác)
└── package-lock.json      ← (đã có sẵn, được cập nhật)
```

### Bước 2 — Chạy dev server

```bash
ng serve
```

Sau lệnh này, thư mục sau được sinh:

```
retail frontend/
├── .angular/              ← (sinh mới, Angular build cache)
│   └── cache/
│       └── 17.3.17/
│           └── vite/
│               └── deps/  ← (pre-bundled dependencies cho Vite)
```

Terminal hiển thị:

```
  ➜  Local:   http://localhost:4200/
```

→ Mở trình duyệt tại **http://localhost:4200** để trải nghiệm web.

### Bước 3 — Build production (tùy chọn)

```bash
ng build
```

Sau lệnh này, thư mục sau được sinh:

```
retail frontend/
└── dist/
    └── retail-platform/
        └── browser/
            ├── index.html
            ├── main-*.js
            ├── polyfills-*.js
            ├── styles-*.css
            ├── chunk-*.js          ← (21+ lazy-loaded chunks, mỗi feature module 1 chunk)
            └── assets/
                ├── images/
                └── i18n/
                    ├── vi.json
                    └── en.json
```

---

## 3. Dependencies — package.json

```
@angular/core                     ^17.3.0      Framework chính
@angular/router                   ^17.3.0      Routing + lazy loading
@angular/forms                    ^17.3.0      Template-driven & Reactive forms
@angular/animations               ^17.3.0      Animations
@angular/cdk                      ^17.3.0      Component Dev Kit
@ngrx/store                       ^17.1.0      State management (Redux)
@ngrx/effects                     ^17.1.0      Side effects
@ngrx/entity                      ^17.1.0      Entity adapter
@ngrx/store-devtools              ^17.1.0      DevTools extension
@syncfusion/ej2-angular-charts    ^32.2.7      Syncfusion Charts
@syncfusion/ej2-angular-grids     ^32.2.7      Syncfusion DataGrid
ag-grid-angular                   ^35.1.0      ag-Grid (danh sách KH, hồ sơ vay)
@ng-select/ng-select              ^12          Searchable dropdown
@ngx-translate/core               ^15.0.0      i18n đa ngôn ngữ (vi/en)
@ngx-translate/http-loader        ^8.0.0       Loader cho translation JSON
@improbable-eng/grpc-web          ^0.15.0      gRPC-Web client
@stomp/rx-stomp                   ^2.3.0       STOMP/WebSocket client
sockjs-client                     ^1.6.1       SockJS fallback
echarts                           ^6.0.0       Apache ECharts
ngx-echarts                       ^21.0.0      Angular wrapper cho ECharts
d3                                ^7.9.0       D3.js (Pareto chart, SHAP bar chart)
leaflet                           ^1.9.4       Leaflet maps
@asymmetrik/ngx-leaflet           ^17.0.0      Angular wrapper cho Leaflet
bpmn-js                           ^18.12.0     BPMN workflow viewer
ng2-pdf-viewer                    ^10.4.0      PDF viewer (tài liệu hồ sơ)
ngx-dropzone                      ^3.1.0       File drag & drop upload
ngx-image-cropper                 ^9.1.6       Image crop (eKYC CCCD)
```

---

## 4. Tương thích Frontend ↔ Backend

### Kiến trúc tổng quan

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 17+)                     │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ GrpcService  │  │ StompService │  │ HttpClient (REST)   │ │
│  │ grpc-web     │  │ rx-stomp     │  │ auth.interceptor.ts │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬──────────┘ │
└─────────┼─────────────────┼──────────────────────┼───────────┘
          │ gRPC-Web        │ WebSocket/STOMP      │ REST/JSON
          │ (protobuf)      │ (SockJS fallback)    │ (JWT Bearer)
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   ENVOY PROXY / API GATEWAY                  │
│              (Go + Gin/Echo, port 8080/443)                  │
└──────┬──────────────┬───────────────────┬────────────────────┘
       │              │                   │
       ▼              ▼                   ▼
┌─────────────┐ ┌───────────┐ ┌─────────────────────────────┐
│ Model Serving│ │  Kafka    │ │    Microservices (Go)       │
│             │ │  Broker   │ │                             │
│ Seldon Core │ │           │ │  Loan Service               │
│  (gRPC:9000)│ │  Topics:  │ │  Customer Service           │
│             │ │  alerts   │ │  Scoring Orchestrator       │
│ Kubeflow    │ │  metrics  │ │  Workflow Engine            │
│  (gRPC:9001)│ │  loan-ev  │ │  Portfolio Service          │
│             │ │  ews      │ │  Notification Service       │
│ SageMaker   │ │           │ │  Admin / Keycloak SSO       │
│  (REST)     │ └─────┬─────┘ └─────────────────────────────┘
│             │       │
│ PredictionIO│       ▼
│  (REST)     │ ┌───────────┐
└─────────────┘ │ STOMP     │
                │ Bridge    │
                └───────────┘
```

### Giao thức kết nối chi tiết

| Frontend Module | Backend Service | Giao thức | Endpoint |
|---|---|---|---|
| AI Scoring | Seldon Core (XGBoost, LightGBM) | **gRPC-Web** | `seldon.cdss.local:8443` |
| AI Scoring | Kubeflow Serving (TensorFlow) | **gRPC-Web** | `kubeflow.cdss.local:8443` |
| AI Scoring | SageMaker (Fraud Detection) | **REST** | `api.cdss.local/sagemaker/predict` |
| AI Scoring | PredictionIO (Segmentation) | **REST** | `api.cdss.local/pio/predict` |
| AutoML | H2O.ai / IBM AutoAI / Watson Studio | **REST** | `api.cdss.local/automl/*` |
| Model Governance | ModelDB | **REST** | `api.cdss.local/modeldb/*` |
| Fairness | AIF360 (FastAPI wrapper) | **REST** | `api.cdss.local/fairness/*` |
| XAI | AIX360 (FastAPI wrapper) | **REST** | `api.cdss.local/xai/*` |
| Adversarial | ART (FastAPI wrapper) | **REST** | `api.cdss.local/adversarial/*` |
| Monitoring | Prometheus + Grafana | **STOMP WS** | `ws://localhost:15674/ws` |
| Notifications | Kafka → STOMP Bridge | **STOMP WS** | `/topic/alerts`, `/topic/ews` |
| Loan Updates | Kafka → STOMP Bridge | **STOMP WS** | `/topic/loan-updates` |
| Authentication | Keycloak SSO | **REST** | `api.cdss.local/auth/*` |
| All CRUD | Go + Gin/Echo API Gateway | **REST** | `api.cdss.local/api/v1/*` |

### Lưu trữ dữ liệu (Backend)

| Thành phần | Công nghệ | Mục đích |
|---|---|---|
| Database chính | PostgreSQL | Khách hàng, hồ sơ vay, audit log |
| Cache | Redis | Session, scoring cache, feature store |
| Object Storage | MinIO (S3-compatible) | PDF tài liệu, model artifacts, dataset |
| Message Broker | Apache Kafka | Event-driven, real-time alerts, EWS |
| Monitoring | Prometheus + Grafana | System metrics, model latency, PSI |
| Tracing | Jaeger | Distributed tracing (gRPC + REST) |
| Container | Docker + Kubernetes | Orchestration toàn bộ microservices |

### Cách chuyển từ Mock → Backend thật

Hiện tại frontend chạy độc lập với **MockDataService** + **MockSocketService**. Để kết nối backend thật:

```
1. MockDataService  →  Thay bằng HttpClient gọi REST API
   Ví dụ: getCustomers()  →  this.http.get('/api/v1/customers')

2. MockSocketService  →  Kích hoạt RxStomp trong stomp.service.ts
   Bỏ comment: this.rxStomp.activate()
   Set: this.connected = true

3. GrpcService  →  Import proto files, dùng grpc.unary() thật
   Cần: protoc --grpc-web_out → generated client stubs

4. AuthService  →  Tích hợp Keycloak SSO
   Thay mock login → redirect tới Keycloak /auth/realms/cdss

5. environment.ts  →  Cập nhật API endpoints
   apiUrl: 'https://api.cdss.local'
   wsUrl: 'wss://api.cdss.local/ws-stomp'
   grpcUrl: 'https://seldon.cdss.local:8443'
```
