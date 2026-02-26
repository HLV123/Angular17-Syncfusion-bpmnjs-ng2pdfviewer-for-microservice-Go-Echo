# gRPC Contracts — CDSS Model Serving

---

## 1. Tổng quan

| Service | Proto file | Port | Framework |
|---------|-----------|:----:|-----------|
| Seldon Core (Credit Risk, Fraud, Behavioral) | `seldon/prediction.proto` | 9000 | Seldon Core |
| Kubeflow Serving (TensorFlow/PyTorch) | `kubeflow/inference.proto` | 9100 | KFServing |
| Scoring Orchestrator (internal) | `scoring/scoring.proto` | 8083 | Go + gRPC |

Frontend gọi qua **gRPC-Web** → **Envoy Proxy** (:8443) transcoding → gRPC backend.

---

## 2. Proto: Seldon Core

### `proto/seldon/prediction.proto`

```protobuf
syntax = "proto3";

package seldon.protos;

option go_package = "cdss-backend/proto/seldon";

service Model {
  rpc Predict (SeldonMessage) returns (SeldonMessage);
  rpc Feedback (Feedback) returns (SeldonMessage);
  rpc Metadata (google.protobuf.Empty) returns (SeldonModelMetadata);
}

message SeldonMessage {
  oneof data_oneof {
    DefaultData data = 1;
    string strData = 2;
    bytes binData = 3;
    string jsonData = 4;
  }
  map<string, google.protobuf.Value> meta = 6;
  Status status = 14;
}

message DefaultData {
  repeated string names = 1;
  Tensor tensor = 2;
}

message Tensor {
  repeated int32 shape = 1;
  repeated double values = 2;
}

message Status {
  int32 code = 1;
  string info = 2;
  string reason = 3;
  enum StatusFlag {
    SUCCESS = 0;
    FAILURE = 1;
  }
  StatusFlag status = 4;
}

message Feedback {
  SeldonMessage request = 1;
  SeldonMessage response = 2;
  float reward = 3;
}

message SeldonModelMetadata {
  string name = 1;
  repeated string versions = 2;
  string platform = 3;
  map<string, google.protobuf.Value> inputs = 4;
  map<string, google.protobuf.Value> outputs = 5;
}
```

### Ví dụ gọi (Go client)

```go
conn, _ := grpc.Dial("seldon-credit-risk:9000", grpc.WithInsecure())
client := seldon.NewModelClient(conn)

req := &seldon.SeldonMessage{
    DataOneof: &seldon.SeldonMessage_Data{
        Data: &seldon.DefaultData{
            Names: []string{"income", "dti", "cic_score", "employment_years", "outstanding"},
            Tensor: &seldon.Tensor{
                Shape:  []int32{1, 5},
                Values: []float64{15000000, 35.0, 720, 5, 180000000},
            },
        },
    },
}

resp, _ := client.Predict(ctx, req)
score := resp.Data.Tensor.Values[0] // 0.731
```

---

## 3. Proto: Kubeflow Serving

### `proto/kubeflow/inference.proto`

```protobuf
syntax = "proto3";

package inference;

option go_package = "cdss-backend/proto/kubeflow";

service GRPCInferenceService {
  rpc ServerLive (ServerLiveRequest) returns (ServerLiveResponse);
  rpc ServerReady (ServerReadyRequest) returns (ServerReadyResponse);
  rpc ModelReady (ModelReadyRequest) returns (ModelReadyResponse);
  rpc ModelInfer (ModelInferRequest) returns (ModelInferResponse);
}

message ModelInferRequest {
  string model_name = 1;
  string model_version = 2;
  string id = 3;
  repeated InferParameter parameters = 4;
  repeated InferInputTensor inputs = 5;
  repeated InferRequestedOutputTensor outputs = 6;
}

message InferInputTensor {
  string name = 1;
  string datatype = 2;
  repeated int64 shape = 3;
  InferTensorContents contents = 5;
}

message InferTensorContents {
  repeated float fp32_contents = 2;
  repeated double fp64_contents = 3;
  repeated int32 int_contents = 4;
  repeated string bytes_contents = 8;
}

message ModelInferResponse {
  string model_name = 1;
  string model_version = 2;
  string id = 3;
  repeated InferOutputTensor outputs = 5;
}

message InferOutputTensor {
  string name = 1;
  string datatype = 2;
  repeated int64 shape = 3;
  InferTensorContents contents = 5;
}

message ServerLiveRequest {}
message ServerLiveResponse { bool live = 1; }
message ServerReadyRequest {}
message ServerReadyResponse { bool ready = 1; }
message ModelReadyRequest {
  string name = 1;
  string version = 2;
}
message ModelReadyResponse { bool ready = 1; }
message InferParameter {
  string key = 1;
  string value = 2;
}
message InferRequestedOutputTensor {
  string name = 1;
}
```

---

## 4. Proto: Scoring Orchestrator (internal)

### `proto/scoring/scoring.proto`

```protobuf
syntax = "proto3";

package scoring;

option go_package = "cdss-backend/proto/scoring";

service ScoringService {
  rpc ScoreLoan (ScoringRequest) returns (ScoringResponse);
  rpc BatchScore (BatchScoringRequest) returns (BatchScoringResponse);
  rpc GetResult (ResultRequest) returns (ScoringResponse);
  rpc HealthCheck (HealthRequest) returns (HealthResponse);
}

message ScoringRequest {
  string loan_id = 1;
  string customer_id = 2;
  repeated string models = 3;    // ["credit_risk", "fraud", "behavioral", "segment"]
  bool async = 4;
}

message ScoringResponse {
  string loan_id = 1;
  int32 total_score = 2;
  string risk_grade = 3;         // EXCELLENT, GOOD, FAIR, POOR
  string recommendation = 4;     // APPROVE, CONDITIONAL, REJECT, MANUAL_REVIEW
  repeated ComponentScore components = 5;
  repeated DimensionScore dimensions = 6;
  int64 scored_at = 7;           // unix timestamp
}

message ComponentScore {
  string name = 1;
  string source = 2;             // Seldon Core, SageMaker, Kubeflow, PredictionIO
  string protocol = 3;           // gRPC, REST
  double score = 4;
  int32 latency_ms = 5;
  string status = 6;             // OK, TIMEOUT, ERROR
}

message DimensionScore {
  string name = 1;               // Payment History, Credit Utilization, ...
  double score = 2;              // 0.0 - 1.0
}

message BatchScoringRequest {
  repeated ScoringRequest requests = 1;
}

message BatchScoringResponse {
  repeated ScoringResponse results = 1;
  int32 total = 2;
  int32 success = 3;
  int32 failed = 4;
}

message ResultRequest {
  string loan_id = 1;
}

message HealthRequest {}
message HealthResponse {
  bool healthy = 1;
  map<string, string> services = 2;   // {"seldon": "UP", "kubeflow": "UP", ...}
}
```

---

## 5. Envoy Config (gRPC-Web transcoding)

```yaml
# envoy.yaml — gRPC-Web → gRPC proxy
static_resources:
  listeners:
    - address:
        socket_address: { address: 0.0.0.0, port_value: 8443 }
      filter_chains:
        - filters:
            - name: envoy.filters.network.http_connection_manager
              typed_config:
                "@type": type.googleapis.com/envoy.extensions.filters.network.http_connection_manager.v3.HttpConnectionManager
                codec_type: AUTO
                stat_prefix: ingress_http
                http_filters:
                  - name: envoy.filters.http.grpc_web     # gRPC-Web transcoding
                  - name: envoy.filters.http.cors
                  - name: envoy.filters.http.router
                route_config:
                  virtual_hosts:
                    - name: grpc_services
                      domains: ["*"]
                      routes:
                        - match: { prefix: "/seldon.protos.Model" }
                          route: { cluster: seldon_cluster, timeout: 5s }
                        - match: { prefix: "/inference.GRPCInferenceService" }
                          route: { cluster: kubeflow_cluster, timeout: 10s }
                        - match: { prefix: "/scoring.ScoringService" }
                          route: { cluster: scoring_cluster, timeout: 15s }

  clusters:
    - name: seldon_cluster
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      http2_protocol_options: {}
      load_assignment:
        cluster_name: seldon_cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address: { address: seldon-credit-risk, port_value: 9000 }

    - name: kubeflow_cluster
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      http2_protocol_options: {}
      load_assignment:
        cluster_name: kubeflow_cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address: { address: kubeflow-serving, port_value: 9100 }

    - name: scoring_cluster
      type: STRICT_DNS
      lb_policy: ROUND_ROBIN
      http2_protocol_options: {}
      circuit_breakers:
        thresholds:
          - max_connections: 100
            max_pending_requests: 50
            max_requests: 200
            max_retries: 3
      load_assignment:
        cluster_name: scoring_cluster
        endpoints:
          - lb_endpoints:
              - endpoint:
                  address:
                    socket_address: { address: scoring-orchestrator, port_value: 8083 }
```

---

## 6. Timeout & Circuit Breaker

| RPC Method | Timeout | Retry | Circuit Breaker |
|------------|:-------:|:-----:|:---------------:|
| Seldon Predict | 5s | 1 | 5 failures → 30s open |
| Kubeflow ModelInfer | 10s | 1 | 5 failures → 30s open |
| Scoring ScoreLoan | 15s | 0 | 10 failures → 60s open |
| Scoring BatchScore | 60s | 0 | 3 failures → 120s open |

---

## 7. Generate code

```bash
# Từ thư mục cdss-backend/
./scripts/generate-proto.sh

# Script nội dung:
protoc --go_out=. --go-grpc_out=. proto/seldon/prediction.proto
protoc --go_out=. --go-grpc_out=. proto/kubeflow/inference.proto
protoc --go_out=. --go-grpc_out=. proto/scoring/scoring.proto
```
