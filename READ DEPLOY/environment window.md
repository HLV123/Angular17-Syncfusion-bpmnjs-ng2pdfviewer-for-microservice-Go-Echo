# Môi Trường Cài Đặt trên Windows — CDSS Full Stack

---

## 1. Tổng quan

| Thành phần | Công cụ | Version tối thiểu |
|---|---|---|
| Runtime Frontend | Node.js | 18.x LTS |
| Package Manager | npm | 9.x |
| CLI Frontend | Angular CLI | 17.x |
| Runtime Backend | Go | 1.22+ |
| Container Engine | Docker Desktop | 4.x |
| Container Compose | Docker Compose | 2.x (built-in) |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Python (AI services) | Python | 3.11+ |
| IDE | VS Code | Latest |

---

## 2. Cài đặt từng bước

### 2.1 Node.js + npm (Frontend)
### 2.2 Angular CLI
### 2.3 Go (Backend)
### 2.4 Docker Desktop (Container cho Kafka, PostgreSQL, Redis, MinIO, Keycloak, Prometheus...)

```powershell
# Sau khi cài, khởi động Docker Desktop
# Kiểm tra:
docker --version           # Docker 27.x
docker compose version     # Docker Compose v2.x
```
### 2.5 Python (AI/ML Services)

### 2.6 PostgreSQL (có thể chạy qua Docker hoặc cài native)

#### Docker (khuyến nghị)
```powershell
docker run -d --name cdss-postgres \
  -e POSTGRES_USER=cdss \
  -e POSTGRES_PASSWORD=cdss123 \
  -e POSTGRES_DB=cdss_db \
  -p 5432:5432 \
  postgres:16
```

### 2.7 Redis (có thể chạy qua Docker)

```powershell
docker run -d --name cdss-redis -p 6379:6379 redis:7-alpine

# Kiểm tra:
docker exec cdss-redis redis-cli ping   # PONG
```

### 2.8 Git
### 2.9 VS Code 
### 2.10 Protobuf Compiler (cho gRPC)

```powershell
# Tải protoc từ https://github.com/protocolbuffers/protobuf/releases
# Giải nén vào C:\protoc, thêm C:\protoc\bin vào PATH

# Cài Go plugins:
go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

# Kiểm tra:
protoc --version
```

---

## 3. Cài dependencies cho từng phần

### Frontend

```powershell
cd "retail frontend"
npm install
```

### Backend (mỗi Go service)

```powershell
cd cdss-backend/services/api-gateway
go mod download

cd ../customer-service
go mod download

# ... tương tự cho các service khác
```

### Python AI Services

```powershell
cd cdss-backend/ai-services/fairness-api
pip install -r requirements.txt

cd ../xai-api
pip install -r requirements.txt

# ... tương tự cho các service khác
```

---

## 4. Khởi chạy toàn bộ

### Bước 1 — Infrastructure (Docker Compose)

```powershell
cd cdss-backend
docker compose -f docker-compose.dev.yml up -d

# Khởi động: PostgreSQL, Redis, Kafka, MinIO, Keycloak, Prometheus, Grafana, Jaeger, Envoy
```

### Bước 2 — Backend Services

```powershell
# Terminal 1: API Gateway
cd services/api-gateway && go run main.go         # :8080

# Terminal 2-9: Business Services
cd services/customer-service && go run main.go     # :8081
cd services/loan-service && go run main.go         # :8082
cd services/scoring-orchestrator && go run main.go # :8083
cd services/workflow-engine && go run main.go      # :8084
cd services/notification-service && go run main.go # :8085
cd services/portfolio-service && go run main.go    # :8086
cd services/compliance-service && go run main.go   # :8087
cd services/admin-service && go run main.go        # :8088
cd services/monitoring-service && go run main.go   # :8089
```

### Bước 3 — Python AI Services

```powershell
cd ai-services/fairness-api && uvicorn main:app --port 9001 --reload
cd ai-services/xai-api && uvicorn main:app --port 9002 --reload
cd ai-services/adversarial-api && uvicorn main:app --port 9003 --reload
cd ai-services/automl-orchestrator && uvicorn main:app --port 9004 --reload
cd ai-services/model-registry && uvicorn main:app --port 9005 --reload
```

### Bước 4 — Frontend

```powershell
cd "retail frontend"
ng serve                                           # :4200
```

### Bước 5 — Mở trình duyệt

```
http://localhost:4200
```

---

## 5. Port mapping tổng hợp

| Port | Service | Loại |
|:----:|---------|------|
| 4200 | Angular Frontend | Frontend |
| 8080 | API Gateway (Echo) | Go |
| 8081 | Customer Service | Go |
| 8082 | Loan Service | Go |
| 8083 | Scoring Orchestrator | Go |
| 8084 | Workflow Engine | Go |
| 8085 | Notification Service | Go |
| 8086 | Portfolio Service | Go |
| 8087 | Compliance Service | Go |
| 8088 | Admin Service | Go |
| 8089 | Monitoring Service | Go |
| 8443 | Envoy Proxy | Infra |
| 9001 | Fairness API (AIF360) | Python |
| 9002 | XAI API (AIX360) | Python |
| 9003 | Adversarial API (ART) | Python |
| 9004 | AutoML Orchestrator | Python |
| 9005 | Model Registry (ModelDB) | Python |
| 5432 | PostgreSQL | Infra |
| 6379 | Redis | Infra |
| 9092 | Apache Kafka | Infra |
| 9000 | MinIO | Infra |
| 8180 | Keycloak SSO | Infra |
| 9090 | Prometheus | Infra |
| 3000 | Grafana | Infra |
| 16686 | Jaeger | Infra |

---

## 6. Chạy chỉ Frontend (không cần backend)

Nếu chỉ muốn trải nghiệm giao diện frontend mà chưa có backend:

```powershell
# Chỉ cần Node.js + npm
cd "retail frontend"
npm install
ng serve
```

Frontend sử dụng **MockDataService** + **MockSocketService** để giả lập toàn bộ dữ liệu. Tất cả 15 module đều hoạt động đầy đủ mà không cần bất kỳ backend service nào.
