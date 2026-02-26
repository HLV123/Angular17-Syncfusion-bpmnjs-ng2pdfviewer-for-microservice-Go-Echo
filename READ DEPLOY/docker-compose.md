# Docker Compose — CDSS Infrastructure

---

## 1. File: `docker-compose.dev.yml`

```yaml
version: "3.9"

services:

  # ============================================
  #  DATABASE
  # ============================================

  postgres:
    image: postgres:16-alpine
    container_name: cdss-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: cdss
      POSTGRES_PASSWORD: cdss123
      POSTGRES_DB: cdss_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U cdss"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: cdss-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # ============================================
  #  MESSAGE BROKER
  # ============================================

  zookeeper:
    image: confluentinc/cp-zookeeper:7.6.0
    container_name: cdss-zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    container_name: cdss-kafka
    depends_on:
      - zookeeper
    restart: unless-stopped
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
    ports:
      - "9092:9092"

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    container_name: cdss-kafka-ui
    depends_on:
      - kafka
    environment:
      KAFKA_CLUSTERS_0_NAME: cdss-local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
    ports:
      - "8090:8080"

  # ============================================
  #  OBJECT STORAGE
  # ============================================

  minio:
    image: minio/minio:latest
    container_name: cdss-minio
    restart: unless-stopped
    environment:
      MINIO_ROOT_USER: cdss_minio
      MINIO_ROOT_PASSWORD: cdss_minio_secret
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data

  # ============================================
  #  AUTHENTICATION
  # ============================================

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: cdss-keycloak
    restart: unless-stopped
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/cdss_db
      KC_DB_USERNAME: cdss
      KC_DB_PASSWORD: cdss123
    command: start-dev --import-realm
    ports:
      - "8180:8080"
    volumes:
      - ./infra/keycloak/realm-cdss.json:/opt/keycloak/data/import/realm-cdss.json
    depends_on:
      postgres:
        condition: service_healthy

  # ============================================
  #  gRPC PROXY
  # ============================================

  envoy:
    image: envoyproxy/envoy:v1.30-latest
    container_name: cdss-envoy
    restart: unless-stopped
    ports:
      - "8443:8443"
    volumes:
      - ./infra/envoy/envoy.yaml:/etc/envoy/envoy.yaml
    command: envoy -c /etc/envoy/envoy.yaml

  # ============================================
  #  MONITORING
  # ============================================

  prometheus:
    image: prom/prometheus:v2.50.0
    container_name: cdss-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./infra/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./infra/prometheus/alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:10.3.0
    container_name: cdss-grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: admin
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./infra/grafana/provisioning:/etc/grafana/provisioning
      - ./infra/grafana/dashboards:/var/lib/grafana/dashboards
    depends_on:
      - prometheus

  jaeger:
    image: jaegertracing/all-in-one:1.54
    container_name: cdss-jaeger
    restart: unless-stopped
    environment:
      COLLECTOR_OTLP_ENABLED: "true"
    ports:
      - "16686:16686"    # Jaeger UI
      - "4317:4317"      # OTLP gRPC
      - "4318:4318"      # OTLP HTTP

volumes:
  postgres_data:
  redis_data:
  minio_data:
  prometheus_data:
  grafana_data:
```

---

## 2. Lệnh sử dụng

```powershell
# Khởi động tất cả
docker compose -f docker-compose.dev.yml up -d

# Xem logs
docker compose -f docker-compose.dev.yml logs -f kafka

# Dừng tất cả
docker compose -f docker-compose.dev.yml down

# Dừng + xóa data
docker compose -f docker-compose.dev.yml down -v

# Restart 1 service
docker compose -f docker-compose.dev.yml restart postgres
```

---

## 3. Kiểm tra sau khi khởi động

| Service | URL | Credentials |
|---------|-----|-------------|
| PostgreSQL | `localhost:5432` | cdss / cdss123 |
| Redis | `localhost:6379` | — |
| Kafka | `localhost:9092` | — |
| Kafka UI | http://localhost:8090 | — |
| MinIO Console | http://localhost:9001 | cdss_minio / cdss_minio_secret |
| Keycloak | http://localhost:8180 | admin / admin |
| Envoy gRPC Proxy | `localhost:8443` | — |
| Prometheus | http://localhost:9090 | — |
| Grafana | http://localhost:3000 | admin / admin |
| Jaeger UI | http://localhost:16686 | — |

---

## 4. Tài nguyên cần thiết

| Tài nguyên | Minimum | Khuyến nghị |
|------------|:-------:|:-----------:|
| RAM | 8 GB | 16 GB |
| Disk | 10 GB | 20 GB |
| CPU | 4 cores | 8 cores |
