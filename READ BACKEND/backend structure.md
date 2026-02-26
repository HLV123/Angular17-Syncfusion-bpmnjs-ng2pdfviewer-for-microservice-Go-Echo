# Backend Structure — CDSS Microservices

---

## 1. Cấu trúc thư mục tổng quan

```
cdss-backend/
├── docker-compose.yml
├── docker-compose.dev.yml
├── Makefile
├── go.work
├── go.work.sum
├── README.md
│
├── deployments/
│   ├── kubernetes/
│   │   ├── namespace.yaml
│   │   ├── api-gateway/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── configmap.yaml
│   │   ├── loan-service/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── hpa.yaml
│   │   ├── scoring-orchestrator/
│   │   │   ├── deployment.yaml
│   │   │   └── service.yaml
│   │   ├── seldon/
│   │   │   ├── credit-risk-model.yaml
│   │   │   ├── fraud-model.yaml
│   │   │   └── behavioral-model.yaml
│   │   ├── kubeflow/
│   │   │   ├── pipeline-credit-retrain.yaml
│   │   │   └── pipeline-feature-eng.yaml
│   │   ├── kafka/
│   │   │   ├── kafka-cluster.yaml
│   │   │   └── kafka-topics.yaml
│   │   ├── monitoring/
│   │   │   ├── prometheus-config.yaml
│   │   │   ├── grafana-dashboards.yaml
│   │   │   └── jaeger.yaml
│   │   ├── keycloak/
│   │   │   ├── deployment.yaml
│   │   │   └── realm-cdss.json
│   │   ├── envoy/
│   │   │   ├── envoy.yaml
│   │   │   └── deployment.yaml
│   │   └── ingress.yaml
│   │
│   └── docker/
│       ├── api-gateway.Dockerfile
│       ├── loan-service.Dockerfile
│       ├── customer-service.Dockerfile
│       ├── scoring-orchestrator.Dockerfile
│       ├── workflow-engine.Dockerfile
│       ├── notification-service.Dockerfile
│       ├── portfolio-service.Dockerfile
│       ├── admin-service.Dockerfile
│       ├── fairness-api.Dockerfile
│       ├── xai-api.Dockerfile
│       └── adversarial-api.Dockerfile
│
├── proto/
│   ├── scoring/
│   │   ├── scoring.proto
│   │   └── scoring_grpc.pb.go
│   ├── seldon/
│   │   ├── prediction.proto
│   │   └── prediction_grpc.pb.go
│   └── kubeflow/
│       ├── inference.proto
│       └── inference_grpc.pb.go
│
├── pkg/
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   ├── postgres.go
│   │   └── redis.go
│   ├── kafka/
│   │   ├── producer.go
│   │   └── consumer.go
│   ├── auth/
│   │   ├── jwt.go
│   │   └── keycloak.go
│   ├── logger/
│   │   └── logger.go
│   ├── middleware/
│   │   ├── cors.go
│   │   ├── auth_middleware.go
│   │   ├── rate_limiter.go
│   │   └── tracing.go
│   ├── minio/
│   │   └── storage.go
│   └── utils/
│       ├── response.go
│       └── validator.go
│
│
│   ┌──────────────────────────────────────────────────┐
│   │          GO MICROSERVICES (Echo v4)              │
│   └──────────────────────────────────────────────────┘
│
├── services/
│   │
│   ├── api-gateway/                    ← Go + Echo
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── config/
│   │   │   └── config.yaml
│   │   ├── routes/
│   │   │   ├── routes.go
│   │   │   ├── customer_routes.go
│   │   │   ├── loan_routes.go
│   │   │   ├── scoring_routes.go
│   │   │   ├── model_routes.go
│   │   │   ├── automl_routes.go
│   │   │   ├── fairness_routes.go
│   │   │   ├── compliance_routes.go
│   │   │   ├── portfolio_routes.go
│   │   │   ├── workflow_routes.go
│   │   │   ├── notification_routes.go
│   │   │   ├── monitoring_routes.go
│   │   │   └── admin_routes.go
│   │   ├── handlers/
│   │   │   ├── proxy_handler.go
│   │   │   ├── grpc_proxy_handler.go
│   │   │   └── ws_handler.go
│   │   └── middleware/
│   │       ├── auth.go
│   │       ├── rbac.go
│   │       └── rate_limit.go
│   │
│   ├── customer-service/               ← Go + Echo
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── config/
│   │   │   └── config.yaml
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   ├── customer.go
│   │   │   │   └── document.go
│   │   │   ├── repository/
│   │   │   │   ├── customer_repo.go
│   │   │   │   └── customer_repo_postgres.go
│   │   │   ├── service/
│   │   │   │   ├── customer_service.go
│   │   │   │   ├── ekyc_service.go
│   │   │   │   └── cic_service.go
│   │   │   └── handler/
│   │   │       ├── customer_handler.go
│   │   │       └── document_handler.go
│   │   ├── migrations/
│   │   │   ├── 001_create_customers.up.sql
│   │   │   ├── 001_create_customers.down.sql
│   │   │   ├── 002_create_documents.up.sql
│   │   │   └── 002_create_documents.down.sql
│   │   └── tests/
│   │       ├── customer_service_test.go
│   │       └── customer_handler_test.go
│   │
│   ├── loan-service/                   ← Go + Echo
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── config/
│   │   │   └── config.yaml
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   ├── loan.go
│   │   │   │   ├── prescreen.go
│   │   │   │   └── timeline.go
│   │   │   ├── repository/
│   │   │   │   ├── loan_repo.go
│   │   │   │   └── loan_repo_postgres.go
│   │   │   ├── service/
│   │   │   │   ├── loan_service.go
│   │   │   │   ├── prescreen_service.go
│   │   │   │   └── sla_service.go
│   │   │   └── handler/
│   │   │       ├── loan_handler.go
│   │   │       └── prescreen_handler.go
│   │   ├── migrations/
│   │   │   ├── 001_create_loans.up.sql
│   │   │   └── 001_create_loans.down.sql
│   │   └── tests/
│   │       └── loan_service_test.go
│   │
│   ├── scoring-orchestrator/           ← Go + Echo + gRPC client
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── config/
│   │   │   └── config.yaml
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   ├── score.go
│   │   │   │   └── scoring_request.go
│   │   │   ├── service/
│   │   │   │   ├── orchestrator.go
│   │   │   │   ├── seldon_client.go
│   │   │   │   ├── kubeflow_client.go
│   │   │   │   ├── sagemaker_client.go
│   │   │   │   └── predictionio_client.go
│   │   │   ├── handler/
│   │   │   │   └── scoring_handler.go
│   │   │   └── grpc/
│   │   │       └── scoring_server.go
│   │   └── tests/
│   │       └── orchestrator_test.go
│   │
│   ├── workflow-engine/                ← Go + Echo
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── config/
│   │   │   └── config.yaml
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   ├── task.go
│   │   │   │   ├── approval.go
│   │   │   │   └── bpmn_definition.go
│   │   │   ├── repository/
│   │   │   │   └── workflow_repo_postgres.go
│   │   │   ├── service/
│   │   │   │   ├── workflow_service.go
│   │   │   │   ├── approval_service.go
│   │   │   │   └── esignature_service.go
│   │   │   └── handler/
│   │   │       └── workflow_handler.go
│   │   └── migrations/
│   │       └── 001_create_workflows.up.sql
│   │
│   ├── notification-service/           ← Go + Echo + Kafka consumer
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── config/
│   │   │   └── config.yaml
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   └── notification.go
│   │   │   ├── service/
│   │   │   │   ├── notification_service.go
│   │   │   │   ├── email_sender.go
│   │   │   │   ├── sms_sender.go
│   │   │   │   └── stomp_publisher.go
│   │   │   ├── handler/
│   │   │   │   └── notification_handler.go
│   │   │   └── consumer/
│   │   │       ├── alert_consumer.go
│   │   │       ├── ews_consumer.go
│   │   │       └── loan_event_consumer.go
│   │   └── migrations/
│   │       └── 001_create_notifications.up.sql
│   │
│   ├── portfolio-service/              ← Go + Echo
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   ├── portfolio.go
│   │   │   │   ├── ecl.go
│   │   │   │   └── stress_test.go
│   │   │   ├── service/
│   │   │   │   ├── portfolio_service.go
│   │   │   │   ├── ecl_calculator.go
│   │   │   │   ├── stress_test_service.go
│   │   │   │   └── migration_matrix_service.go
│   │   │   └── handler/
│   │   │       └── portfolio_handler.go
│   │   └── migrations/
│   │       └── 001_create_portfolio.up.sql
│   │
│   ├── compliance-service/             ← Go + Echo
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   ├── report.go
│   │   │   │   └── model_card.go
│   │   │   ├── service/
│   │   │   │   ├── report_generator.go
│   │   │   │   ├── model_card_service.go
│   │   │   │   └── ifrs9_service.go
│   │   │   └── handler/
│   │   │       └── compliance_handler.go
│   │   └── templates/
│   │       ├── bc001_credit_report.html
│   │       ├── bc002_model_card.html
│   │       └── bc003_ecl_report.html
│   │
│   ├── admin-service/                  ← Go + Echo
│   │   ├── go.mod
│   │   ├── go.sum
│   │   ├── main.go
│   │   ├── internal/
│   │   │   ├── domain/
│   │   │   │   ├── user.go
│   │   │   │   ├── role.go
│   │   │   │   └── audit_log.go
│   │   │   ├── service/
│   │   │   │   ├── user_service.go
│   │   │   │   ├── rbac_service.go
│   │   │   │   └── audit_service.go
│   │   │   └── handler/
│   │   │       ├── user_handler.go
│   │   │       └── config_handler.go
│   │   └── migrations/
│   │       ├── 001_create_users.up.sql
│   │       └── 002_create_audit_logs.up.sql
│   │
│   └── monitoring-service/             ← Go + Echo + Prometheus client
│       ├── go.mod
│       ├── go.sum
│       ├── main.go
│       ├── internal/
│       │   ├── service/
│       │   │   ├── health_checker.go
│       │   │   ├── drift_detector.go
│       │   │   └── ews_engine.go
│       │   └── handler/
│       │       └── monitoring_handler.go
│       └── tests/
│           └── drift_detector_test.go
│
│
│   ┌──────────────────────────────────────────────────┐
│   │        PYTHON AI/ML SERVICES (FastAPI)           │
│   └──────────────────────────────────────────────────┘
│
├── ai-services/
│   │
│   ├── fairness-api/                   ← Python + FastAPI + AIF360
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── fairness_routes.py
│   │   │   │   └── bias_routes.py
│   │   │   ├── services/
│   │   │   │   ├── fairness_service.py
│   │   │   │   └── bias_mitigation_service.py
│   │   │   └── models/
│   │   │       └── fairness_metrics.py
│   │   └── tests/
│   │       └── test_fairness.py
│   │
│   ├── xai-api/                        ← Python + FastAPI + AIX360
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   └── explain_routes.py
│   │   │   ├── services/
│   │   │   │   ├── shap_service.py
│   │   │   │   ├── lime_service.py
│   │   │   │   ├── dice_service.py
│   │   │   │   └── cem_service.py
│   │   │   └── models/
│   │   │       └── explanation.py
│   │   └── tests/
│   │       └── test_shap.py
│   │
│   ├── adversarial-api/                ← Python + FastAPI + ART
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── routes/
│   │   │   │   ├── detection_routes.py
│   │   │   │   └── defense_routes.py
│   │   │   ├── services/
│   │   │   │   ├── attack_detector.py
│   │   │   │   ├── defense_service.py
│   │   │   │   └── hardening_service.py
│   │   │   └── models/
│   │   │       └── attack.py
│   │   └── tests/
│   │       └── test_detection.py
│   │
│   ├── automl-orchestrator/            ← Python + FastAPI
│   │   ├── requirements.txt
│   │   ├── main.py
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   │   ├── h2o_routes.py
│   │   │   │   ├── autoai_routes.py
│   │   │   │   └── watson_routes.py
│   │   │   ├── services/
│   │   │   │   ├── h2o_client.py
│   │   │   │   ├── autoai_client.py
│   │   │   │   ├── watson_client.py
│   │   │   │   └── job_manager.py
│   │   │   └── models/
│   │   │       └── automl_job.py
│   │   └── tests/
│   │       └── test_h2o.py
│   │
│   └── model-registry/                 ← Python + FastAPI + ModelDB
│       ├── requirements.txt
│       ├── main.py
│       ├── app/
│       │   ├── routes/
│       │   │   ├── model_routes.py
│       │   │   └── lineage_routes.py
│       │   ├── services/
│       │   │   ├── modeldb_client.py
│       │   │   ├── lineage_service.py
│       │   │   └── deployment_service.py
│       │   └── models/
│       │       ├── ai_model.py
│       │       └── model_version.py
│       └── tests/
│           └── test_registry.py
│
│
│   ┌──────────────────────────────────────────────────┐
│   │              INFRASTRUCTURE                      │
│   └──────────────────────────────────────────────────┘
│
├── infra/
│   ├── envoy/
│   │   └── envoy.yaml
│   ├── kafka/
│   │   ├── docker-compose.kafka.yml
│   │   └── topics.sh
│   ├── postgres/
│   │   ├── init.sql
│   │   └── pg_hba.conf
│   ├── redis/
│   │   └── redis.conf
│   ├── minio/
│   │   └── init-buckets.sh
│   ├── keycloak/
│   │   └── realm-cdss.json
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   └── alert_rules.yml
│   ├── grafana/
│   │   ├── provisioning/
│   │   │   ├── datasources.yaml
│   │   │   └── dashboards.yaml
│   │   └── dashboards/
│   │       ├── model-performance.json
│   │       ├── system-health.json
│   │       └── loan-pipeline.json
│   └── jaeger/
│       └── jaeger.yaml
│
└── scripts/
    ├── setup-dev.sh
    ├── migrate.sh
    ├── seed-data.sh
    ├── generate-proto.sh
    └── deploy-k8s.sh
```

---

## 2. Framework chi tiết theo service

### Go Microservices

| Service | Framework | Port | Database | Giao thức |
|---------|-----------|:----:|----------|-----------|
| api-gateway | **Echo v4** | 8080 | — | REST + gRPC Gateway + WebSocket |
| customer-service | **Echo v4** | 8081 | PostgreSQL | REST |
| loan-service | **Echo v4** | 8082 | PostgreSQL | REST |
| scoring-orchestrator | **Echo v4** | 8083 | Redis (cache) | REST + gRPC client |
| workflow-engine | **Echo v4** | 8084 | PostgreSQL | REST |
| notification-service | **Echo v4** | 8085 | PostgreSQL | REST + Kafka consumer + STOMP publisher |
| portfolio-service | **Echo v4** | 8086 | PostgreSQL | REST |
| compliance-service | **Echo v4** | 8087 | PostgreSQL | REST |
| admin-service | **Echo v4** | 8088 | PostgreSQL | REST |
| monitoring-service | **Echo v4** | 8089 | Prometheus | REST + Prometheus client |

### Python AI/ML Services

| Service | Framework | Port | AI Library | Giao thức |
|---------|-----------|:----:|-----------|-----------|
| fairness-api | **FastAPI** | 9001 | **AI Fairness 360 (AIF360)** | REST |
| xai-api | **FastAPI** | 9002 | **AI Explainability 360 (AIX360)** | REST |
| adversarial-api | **FastAPI** | 9003 | **Adversarial Robustness Toolbox (ART)** | REST |
| automl-orchestrator | **FastAPI** | 9004 | **H2O.ai / IBM AutoAI / Watson Studio** | REST |
| model-registry | **FastAPI** | 9005 | **ModelDB** | REST |

### Model Serving (Kubernetes)

| Platform | Framework | Port | Giao thức |
|----------|-----------|:----:|-----------|
| Seldon Core | **XGBoost / LightGBM** | 9000 (gRPC), 9500 (REST) | **gRPC** (primary) |
| Kubeflow Serving | **TensorFlow / PyTorch** | 9100 (gRPC), 9600 (REST) | **gRPC** (primary) |
| AWS SageMaker | **SageMaker Runtime** | HTTPS | **REST** |
| PredictionIO | **Apache PredictionIO** | 8000 | **REST** |

### Infrastructure

| Thành phần | Công nghệ | Port |
|------------|-----------|:----:|
| Reverse Proxy / gRPC-Web transcoder | **Envoy Proxy** | 8443 |
| Message Broker | **Apache Kafka** | 9092 |
| STOMP Bridge | **Custom Go / Spring** | 15674 |
| Database | **PostgreSQL 16** | 5432 |
| Cache | **Redis 7** | 6379 |
| Object Storage | **MinIO** | 9000 |
| SSO / Auth | **Keycloak 24** | 8180 |
| Metrics | **Prometheus** | 9090 |
| Dashboards | **Grafana** | 3000 |
| Tracing | **Jaeger** | 16686 |

---

## 3. Lệnh khởi chạy

### Development (Docker Compose)

```bash
# Khởi động toàn bộ infrastructure
docker-compose -f docker-compose.dev.yml up -d

# Chạy migrations
make migrate-all

# Seed data mẫu
make seed

# Khởi động từng Go service (dev mode với hot reload)
cd services/api-gateway && go run main.go
cd services/customer-service && go run main.go
cd services/loan-service && go run main.go
# ... (tương tự cho các service khác)

# Khởi động Python AI services
cd ai-services/fairness-api && uvicorn main:app --port 9001 --reload
cd ai-services/xai-api && uvicorn main:app --port 9002 --reload
cd ai-services/adversarial-api && uvicorn main:app --port 9003 --reload
cd ai-services/automl-orchestrator && uvicorn main:app --port 9004 --reload
cd ai-services/model-registry && uvicorn main:app --port 9005 --reload
```

### Production (Kubernetes)

```bash
# Apply tất cả manifests
kubectl apply -f deployments/kubernetes/namespace.yaml
kubectl apply -f deployments/kubernetes/ -R

# Hoặc dùng script
./scripts/deploy-k8s.sh production
```

---

## 4. Luồng request Frontend → Backend

```
Browser (Angular)
    │
    ├── REST ──────► Envoy :8443 ──► api-gateway :8080 ──┬── customer-service :8081
    │                                                     ├── loan-service :8082
    │                                                     ├── workflow-engine :8084
    │                                                     ├── portfolio-service :8086
    │                                                     ├── compliance-service :8087
    │                                                     ├── admin-service :8088
    │                                                     └── monitoring-service :8089
    │
    ├── gRPC-Web ──► Envoy :8443 ──► scoring-orchestrator :8083
    │                                     ├── gRPC ──► Seldon Core :9000
    │                                     ├── gRPC ──► Kubeflow :9100
    │                                     ├── REST ──► SageMaker (AWS)
    │                                     └── REST ──► PredictionIO :8000
    │
    ├── REST ──────► Envoy :8443 ──► fairness-api :9001 (AIF360)
    │                            ──► xai-api :9002 (AIX360)
    │                            ──► adversarial-api :9003 (ART)
    │                            ──► automl-orchestrator :9004 (H2O/AutoAI)
    │                            ──► model-registry :9005 (ModelDB)
    │
    └── WebSocket ─► Envoy :8443 ──► notification-service :8085
                                          │
                                          ├── Kafka consumer ◄── loan-service (events)
                                          ├── Kafka consumer ◄── monitoring-service (alerts)
                                          └── STOMP publish ──► Browser (/topic/*)
```

---

## 5. Kafka Topics

| Topic | Producer | Consumer | Mô tả |
|-------|----------|----------|-------|
| `loan-events` | loan-service | notification-service | Trạng thái hồ sơ thay đổi |
| `scoring-results` | scoring-orchestrator | loan-service | Kết quả AI scoring |
| `system-alerts` | monitoring-service | notification-service | Cảnh báo hệ thống |
| `ews-signals` | monitoring-service | notification-service | EWS alerts |
| `model-metrics` | monitoring-service | notification-service | PSI, latency, AUC |
| `audit-events` | all services | admin-service | Audit trail |
| `compliance-reports` | compliance-service | notification-service | Báo cáo được tạo |
