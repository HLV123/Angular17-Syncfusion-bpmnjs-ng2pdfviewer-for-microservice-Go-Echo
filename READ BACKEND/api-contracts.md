# API Contracts — CDSS Backend

---

## 1. Quy ước chung

### Base URL
```
Production:  https://api.cdss.local/api/v1
Development: http://localhost:8080/api/v1
```

### Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```
Token lấy từ Keycloak SSO (`POST /auth/login`), TTL = 30 phút, refresh token = 7 ngày.

### Response Format chuẩn

#### Thành công
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

#### Lỗi
```json
{
  "success": false,
  "error": {
    "code": "LOAN_NOT_FOUND",
    "message": "Không tìm thấy hồ sơ vay LV-9999",
    "details": []
  }
}
```

### HTTP Status Codes

| Code | Ý nghĩa |
|:----:|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request — validation lỗi |
| 401 | Unauthorized — thiếu/hết hạn token |
| 403 | Forbidden — không có quyền (RBAC) |
| 404 | Not Found |
| 409 | Conflict — trùng dữ liệu |
| 422 | Unprocessable Entity — logic lỗi |
| 500 | Internal Server Error |
| 503 | Service Unavailable — downstream down |

### Pagination
```
GET /api/v1/customers?page=2&pageSize=20&sort=createdAt&order=desc
```

### Filter
```
GET /api/v1/loans?status=REVIEWING&productType=MORTGAGE&minAmount=500000000
```

---

## 2. Auth Service (Keycloak)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| POST | `/auth/login` | Đăng nhập, trả JWT | Public |
| POST | `/auth/refresh` | Refresh token | Authenticated |
| POST | `/auth/logout` | Thu hồi token | Authenticated |
| GET | `/auth/me` | Thông tin user hiện tại | Authenticated |

### POST `/auth/login`
```json
// Request
{ "username": "analyst_an", "password": "***" }

// Response 200
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 1800,
  "user": {
    "id": "U001",
    "username": "analyst_an",
    "fullName": "Nguyễn Văn An",
    "role": "CREDIT_ANALYST",
    "department": "Phòng Phân tích",
    "email": "an.nv@bank.vn"
  }
}
```

---

## 3. Customer Service (:8081)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| GET | `/customers` | Danh sách KH (paginated) | ANALYST, OFFICER, MANAGER, ADMIN, CS |
| GET | `/customers/:id` | Chi tiết KH 360° | ANALYST, OFFICER, MANAGER, ADMIN, CS |
| POST | `/customers` | Tạo KH mới | ANALYST, OFFICER, ADMIN |
| PUT | `/customers/:id` | Cập nhật KH | ANALYST, OFFICER, ADMIN |
| POST | `/customers/:id/documents` | Upload tài liệu (multipart) | ANALYST, OFFICER |
| GET | `/customers/:id/documents` | Danh sách tài liệu | ANALYST, OFFICER, MANAGER |
| POST | `/customers/:id/ekyc` | Xác thực eKYC (OCR + Face) | ANALYST, OFFICER |
| GET | `/customers/:id/cic` | Tra cứu CIC score | ANALYST, OFFICER, MANAGER |

### GET `/customers`
```
GET /api/v1/customers?page=1&pageSize=20&search=Nguyễn&status=ACTIVE&province=TP.HCM
```
```json
// Response 200
{
  "success": true,
  "data": [
    {
      "id": "KH001",
      "fullName": "Nguyễn Thị Hồng",
      "cccd": "001200012345",
      "phone": "0912345001",
      "province": "TP.HCM",
      "status": "ACTIVE",
      "internalScore": 731,
      "totalOutstanding": 180000000,
      "ekycVerified": true,
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 10 }
}
```

### POST `/customers/:id/documents`
```
Content-Type: multipart/form-data

file: (binary)
type: "CCCD" | "BANK_STATEMENT" | "CONTRACT" | "SALARY_SLIP" | "COLLATERAL"
ocrEnabled: true
```

---

## 4. Loan Service (:8082)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| GET | `/loans` | Danh sách hồ sơ vay | ANALYST, OFFICER, MANAGER, ADMIN |
| GET | `/loans/:id` | Chi tiết hồ sơ | ANALYST, OFFICER, MANAGER |
| POST | `/loans` | Tạo đơn vay mới | ANALYST, OFFICER |
| PUT | `/loans/:id` | Cập nhật hồ sơ | ANALYST, OFFICER |
| POST | `/loans/:id/prescreen` | Chạy pre-screening | ANALYST, OFFICER |
| POST | `/loans/:id/submit` | Nộp hồ sơ thẩm định | ANALYST |
| PUT | `/loans/:id/status` | Cập nhật trạng thái | OFFICER, MANAGER |
| GET | `/loans/:id/timeline` | Lịch sử xử lý | ANALYST, OFFICER, MANAGER |
| GET | `/loans/stats` | Thống kê pipeline | MANAGER, ADMIN |
| GET | `/loans/sla-metrics` | SLA từng giai đoạn | MANAGER, ADMIN |

### POST `/loans`
```json
// Request
{
  "customerId": "KH001",
  "productType": "CONSUMER",
  "amount": 350000000,
  "term": 36,
  "interestRate": 9.5,
  "purpose": "Mua xe ô tô",
  "collateralType": null,
  "collateralValue": null
}

// Response 201
{
  "success": true,
  "data": {
    "id": "LV-2450",
    "status": "DRAFT",
    "createdAt": "2026-02-26T10:00:00Z"
  }
}
```

### POST `/loans/:id/prescreen`
```json
// Response 200
{
  "success": true,
  "data": {
    "status": "PASS",
    "cicCheck": true,
    "blacklistCheck": true,
    "basicConditionCheck": true,
    "details": [
      "CIC: Lịch sử tốt",
      "Không trong danh sách đen",
      "Đủ điều kiện thu nhập"
    ],
    "timestamp": "2026-02-26T10:01:00Z"
  }
}
```

---

## 5. Scoring Orchestrator (:8083)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| POST | `/scoring/predict` | Chấm điểm tín dụng (ensemble) | ANALYST, OFFICER, MANAGER |
| POST | `/scoring/batch` | Batch scoring (nhiều hồ sơ) | MANAGER, DS |
| GET | `/scoring/:loanId/result` | Kết quả scoring | ANALYST, OFFICER, MANAGER |
| POST | `/scoring/:loanId/override` | Override AI score | MANAGER |

### POST `/scoring/predict`
```json
// Request
{
  "loanId": "LV-2435",
  "customerId": "KH001",
  "models": ["credit_risk", "fraud", "behavioral", "segment"]
}

// Response 200
{
  "success": true,
  "data": {
    "totalScore": 731,
    "riskGrade": "GOOD",
    "recommendation": "APPROVE",
    "components": [
      { "name": "Credit Risk (XGBoost)", "source": "Seldon Core", "protocol": "gRPC", "score": 745, "latency": 45 },
      { "name": "Fraud Detection", "source": "SageMaker", "protocol": "REST", "score": 890, "latency": 120 },
      { "name": "Behavioral Score", "source": "Kubeflow", "protocol": "gRPC", "score": 680, "latency": 38 },
      { "name": "Customer Segment", "source": "PredictionIO", "protocol": "REST", "score": 0.72, "latency": 95 }
    ],
    "dimensions": [
      { "name": "Payment History", "score": 0.85 },
      { "name": "Credit Utilization", "score": 0.62 },
      { "name": "Credit Length", "score": 0.78 },
      { "name": "Income Stability", "score": 0.71 },
      { "name": "Debt Ratio", "score": 0.55 }
    ]
  }
}
```

---

## 6. Workflow Engine (:8084)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| GET | `/workflow/tasks` | Danh sách task phê duyệt | OFFICER, MANAGER |
| GET | `/workflow/tasks/:id` | Chi tiết task | OFFICER, MANAGER |
| POST | `/workflow/tasks/:id/approve` | Phê duyệt | OFFICER, MANAGER |
| POST | `/workflow/tasks/:id/reject` | Từ chối | OFFICER, MANAGER |
| POST | `/workflow/tasks/:id/return` | Trả hồ sơ bổ sung | OFFICER, MANAGER |
| POST | `/workflow/tasks/:id/sign` | Ký số (HSM/Token) | OFFICER, MANAGER |

### POST `/workflow/tasks/:id/approve`
```json
// Request
{
  "decision": "APPROVE",
  "approvedAmount": 350000000,
  "conditions": ["Giải ngân sau khi có hợp đồng mua bán"],
  "note": "Hồ sơ đầy đủ, AI score 731, DTI 35%",
  "signatureData": "base64_encoded_signature"
}
```

---

## 7. Portfolio Service (:8086)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| GET | `/portfolio/summary` | Tổng quan danh mục | MANAGER, RISK_MGR |
| GET | `/portfolio/migration-matrix` | Ma trận dịch chuyển nợ | MANAGER, RISK_MGR |
| GET | `/portfolio/vintage` | Vintage analysis | MANAGER, RISK_MGR |
| POST | `/portfolio/stress-test` | Chạy stress test | RISK_MGR |
| GET | `/portfolio/ecl` | IFRS 9 ECL stages | RISK_MGR, COMPLIANCE |
| GET | `/portfolio/province-risk` | Rủi ro theo tỉnh/thành | MANAGER, RISK_MGR |

---

## 8. Notification Service (:8085)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| GET | `/notifications` | Danh sách thông báo | Authenticated |
| PUT | `/notifications/:id/read` | Đánh dấu đã đọc | Authenticated |
| PUT | `/notifications/read-all` | Đánh dấu tất cả đã đọc | Authenticated |
| GET | `/notifications/settings` | Cài đặt thông báo | Authenticated |
| PUT | `/notifications/settings` | Cập nhật cài đặt | Authenticated |

---

## 9. Compliance Service (:8087)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| GET | `/compliance/reports` | Danh sách báo cáo | COMPLIANCE, RISK_MGR |
| GET | `/compliance/reports/:id` | Chi tiết báo cáo | COMPLIANCE, RISK_MGR |
| POST | `/compliance/reports/generate` | Tạo báo cáo mới | COMPLIANCE |
| GET | `/compliance/model-cards` | Model cards | COMPLIANCE, DS |
| GET | `/compliance/ecl` | IFRS 9 ECL report | COMPLIANCE, RISK_MGR |

---

## 10. Monitoring Service (:8089)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| GET | `/monitoring/health` | System health check | ADMIN, DS |
| GET | `/monitoring/models` | Model health metrics | DS, RISK_MGR |
| GET | `/monitoring/drift` | Data drift features | DS, RISK_MGR |
| GET | `/monitoring/ews` | EWS alerts | MANAGER, RISK_MGR |

---

## 11. Admin Service (:8088)

| Method | Endpoint | Mô tả | Roles |
|:------:|----------|-------|-------|
| GET | `/admin/users` | Danh sách users | ADMIN |
| POST | `/admin/users` | Tạo user mới | ADMIN |
| PUT | `/admin/users/:id` | Cập nhật user | ADMIN |
| PUT | `/admin/users/:id/toggle-status` | Kích hoạt/vô hiệu | ADMIN |
| GET | `/admin/roles` | Danh sách roles | ADMIN |
| GET | `/admin/audit-logs` | Audit log | ADMIN, COMPLIANCE |
| GET | `/admin/config` | Cấu hình hệ thống | ADMIN |
| PUT | `/admin/config` | Cập nhật cấu hình | ADMIN |

---

## 12. AI Services (Python FastAPI)

### Fairness API (:9001)

| Method | Endpoint | Mô tả |
|:------:|----------|-------|
| POST | `/fairness/evaluate` | Đánh giá fairness metrics |
| POST | `/fairness/mitigate` | Áp dụng bias mitigation |
| GET | `/fairness/metrics` | Kết quả fairness hiện tại |

### XAI API (:9002)

| Method | Endpoint | Mô tả |
|:------:|----------|-------|
| POST | `/xai/shap` | SHAP explanation |
| POST | `/xai/lime` | LIME explanation |
| POST | `/xai/dice` | DiCE counterfactual |
| POST | `/xai/cem` | CEM contrastive |

### Adversarial API (:9003)

| Method | Endpoint | Mô tả |
|:------:|----------|-------|
| POST | `/adversarial/detect` | Phát hiện tấn công |
| POST | `/adversarial/defend` | Áp dụng defense |
| GET | `/adversarial/attacks` | Lịch sử tấn công |
| POST | `/adversarial/robustness-test` | Test độ bền model |

### AutoML Orchestrator (:9004)

| Method | Endpoint | Mô tả |
|:------:|----------|-------|
| POST | `/automl/jobs` | Tạo AutoML job |
| GET | `/automl/jobs` | Danh sách jobs |
| GET | `/automl/jobs/:id` | Chi tiết job |
| POST | `/automl/jobs/:id/stop` | Dừng job |
| GET | `/automl/datasets` | Danh sách datasets |

### Model Registry (:9005)

| Method | Endpoint | Mô tả |
|:------:|----------|-------|
| GET | `/models` | Danh sách models |
| GET | `/models/:id` | Chi tiết model |
| GET | `/models/:id/versions` | Danh sách versions |
| POST | `/models/:id/deploy` | Deploy model |
| GET | `/models/:id/lineage` | Model lineage |
| POST | `/models/:id/ab-test` | Tạo A/B test |
