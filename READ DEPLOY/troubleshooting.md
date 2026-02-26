# Troubleshooting — CDSS Project

---

## 1. Frontend Issues

### ❌ `ng serve` fail — `Cannot resolve module`

**Triệu chứng:**
```
X [ERROR] Could not resolve "@stomp/stompjs"
```

**Nguyên nhân:** Peer dependency chưa cài.

**Fix:**
```powershell
npm install @stomp/stompjs --legacy-peer-deps
# Hoặc nếu không cần STOMP thật, stomp.service.ts đã dùng mock fallback
```

---

### ❌ `ng serve` fail — peer dependency conflict

**Triệu chứng:**
```
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Fix:**
```powershell
npm install --legacy-peer-deps
```

---

### ❌ Vite warning — dynamic import

**Triệu chứng:**
```
The above dynamic import cannot be analyzed by Vite
Plugin: vite:import-analysis
File: ng2-pdf-viewer.js
```

**Nguyên nhân:** ng2-pdf-viewer dùng dynamic import không tương thích Vite.

**Fix:** Warning này không ảnh hưởng chức năng, có thể bỏ qua. Nếu muốn xóa warning:
```typescript
// angular.json → build → options
"allowedCommonJsDependencies": ["ng2-pdf-viewer"]
```

---

### ❌ Blank page sau login

**Nguyên nhân:** Route guard redirect loop.

**Debug:**
```typescript
// auth.guard.ts — thêm console.log
console.log('Auth guard:', this.auth.isLoggedIn(), this.auth.user());
```

**Fix:** Đảm bảo `AuthService.login()` set `isLoggedIn = true` trước khi `router.navigate`.

---

### ❌ ag-Grid không hiển thị data

**Nguyên nhân:** Thiếu theme CSS.

**Fix:** Đảm bảo `styles.scss` có:
```scss
@import 'ag-grid-community/styles/ag-grid.css';
@import 'ag-grid-community/styles/ag-theme-alpine.css';
```

---

### ❌ Leaflet map trắng

**Nguyên nhân:** Thiếu CSS + marker icons.

**Fix:**
```scss
// styles.scss
@import 'leaflet/dist/leaflet.css';
```
```typescript
// component
import * as L from 'leaflet';
L.Icon.Default.imagePath = 'assets/leaflet/';
```

---

## 2. Backend Issues (Go)

### ❌ `go run main.go` — port already in use

```
listen tcp :8081: bind: address already in use
```

**Fix:**
```powershell
# Tìm process đang chiếm port
netstat -ano | findstr :8081
# Kill process
taskkill /PID <PID> /F
```

---

### ❌ PostgreSQL connection refused

```
dial tcp 127.0.0.1:5432: connect: connection refused
```

**Debug:**
```powershell
# Kiểm tra PostgreSQL đang chạy
docker ps | findstr postgres

# Nếu chưa chạy
docker start cdss-postgres

# Kiểm tra connectivity
docker exec cdss-postgres pg_isready -U cdss
```

---

### ❌ Kafka consumer không nhận message

**Debug:**
```powershell
# Kiểm tra topic tồn tại
docker exec cdss-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Produce test message
docker exec cdss-kafka kafka-console-producer.sh --bootstrap-server localhost:9092 --topic loan-events

# Consume test
docker exec cdss-kafka kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic loan-events --from-beginning
```

**Nguyên nhân phổ biến:**
- Consumer group ID sai
- Topic chưa được tạo (`auto.create.topics.enable=false`)
- Partition assignment chưa hoàn tất (đợi 10-30s)

---

### ❌ gRPC timeout từ Seldon Core

```
rpc error: code = DeadlineExceeded desc = context deadline exceeded
```

**Debug:**
```powershell
# Kiểm tra Seldon pod
kubectl get pods -n seldon-system
kubectl logs seldon-credit-risk-0-predictor -n seldon-system

# Test gRPC trực tiếp
grpcurl -plaintext localhost:9000 seldon.protos.Model/Predict
```

**Fix:**
- Tăng timeout trong Envoy config
- Kiểm tra model loaded thành công
- Kiểm tra resource requests/limits

---

## 3. Docker Issues

### ❌ Docker Desktop không khởi động

**Fix (Windows):**
```powershell
# Bật WSL 2
wsl --install
wsl --set-default-version 2

# Bật Hyper-V (PowerShell Admin)
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Restart máy
```

---

### ❌ Docker Compose — container restart loop

**Debug:**
```powershell
docker compose -f docker-compose.dev.yml logs -f --tail 50 <service-name>
```

**Nguyên nhân phổ biến:**
- Keycloak: PostgreSQL chưa ready → thêm `depends_on: condition: service_healthy`
- Kafka: Zookeeper chưa ready → Kafka auto retry
- MinIO: Port 9000 conflict với Seldon → đổi MinIO port

---

### ❌ Out of disk space

```powershell
# Xóa unused images
docker system prune -a

# Xóa volumes
docker volume prune
```

---

## 4. Distributed Tracing (Jaeger)

### Truy cập
```
http://localhost:16686
```

### Debug slow request
1. Mở Jaeger UI → Search by service name (vd: `scoring-orchestrator`)
2. Filter by duration > 5s
3. Xem trace → tìm span nào chậm nhất
4. Thường là: Seldon gRPC call, PostgreSQL query, hoặc Kafka produce

### Typical trace flow
```
api-gateway (2ms)
  └── scoring-orchestrator (280ms)
       ├── seldon-credit-risk (45ms)    ← gRPC
       ├── sagemaker-fraud (120ms)      ← REST
       ├── kubeflow-behavioral (38ms)   ← gRPC
       └── predictionio-segment (95ms)  ← REST
```

---

## 5. Symptom Checklist

| Triệu chứng | Kiểm tra đầu tiên | Công cụ |
|---|---|---|
| Frontend trắng | Browser Console (F12) | Chrome DevTools |
| API trả 401 | Token hết hạn? | Refresh token / re-login |
| API trả 403 | Role đúng chưa? | Kiểm tra RBAC matrix |
| API trả 500 | Backend logs | `docker compose logs <service>` |
| API trả 503 | Service down? | `docker ps`, `kubectl get pods` |
| Real-time không cập nhật | STOMP connected? | Browser Network tab → WS |
| Scoring chậm > 5s | Model serving OK? | Jaeger trace |
| Data drift alert sai | Prometheus metrics | Grafana dashboard |
| Kafka lag tăng | Consumer chậm? | Kafka UI (localhost:8090) |
| Build failed | Dependency conflict | `npm install --legacy-peer-deps` |
