# Database Schema — CDSS (PostgreSQL 16)

---

## 1. Quy ước

- Tên bảng: `snake_case`, số nhiều (`customers`, `loans`)
- Primary key: `id UUID DEFAULT gen_random_uuid()`
- Timestamp: `created_at`, `updated_at` kiểu `TIMESTAMPTZ`
- Soft delete: `deleted_at TIMESTAMPTZ NULL`
- Index: prefix `idx_`, unique: prefix `uq_`

---

## 2. Customer Service DB

### Bảng `customers`
```sql
CREATE TABLE customers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code   VARCHAR(10) UNIQUE NOT NULL,           -- KH001
    full_name       VARCHAR(255) NOT NULL,
    cccd            VARCHAR(12) UNIQUE NOT NULL,
    date_of_birth   DATE NOT NULL,
    gender          CHAR(1) CHECK (gender IN ('M', 'F')),
    phone           VARCHAR(15) NOT NULL,
    email           VARCHAR(255),
    address         TEXT,
    province        VARCHAR(100),
    customer_type   VARCHAR(20) DEFAULT 'INDIVIDUAL'       -- INDIVIDUAL, BUSINESS, SME
                    CHECK (customer_type IN ('INDIVIDUAL', 'BUSINESS', 'SME')),
    internal_score  INT,
    credit_limit    BIGINT DEFAULT 0,
    total_outstanding BIGINT DEFAULT 0,
    cic_score       INT,
    ekyc_verified   BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLACKLISTED')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_customers_cccd ON customers(cccd);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_province ON customers(province);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_search ON customers USING GIN(to_tsvector('simple', full_name || ' ' || cccd || ' ' || phone));
```

### Bảng `customer_documents`
```sql
CREATE TABLE customer_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id   UUID NOT NULL REFERENCES customers(id),
    name          VARCHAR(255) NOT NULL,
    type          VARCHAR(30) NOT NULL
                  CHECK (type IN ('CCCD', 'BANK_STATEMENT', 'CONTRACT', 'SALARY_SLIP', 'COLLATERAL', 'OTHER')),
    file_url      TEXT NOT NULL,                           -- MinIO path
    file_size     INT,
    mime_type     VARCHAR(100),
    ocr_extracted BOOLEAN DEFAULT FALSE,
    ocr_data      JSONB,
    expiry_date   DATE,
    uploaded_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_docs_customer ON customer_documents(customer_id);
```

---

## 3. Loan Service DB

### Bảng `loans`
```sql
CREATE TABLE loans (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_code         VARCHAR(10) UNIQUE NOT NULL,           -- LV-2435
    customer_id       UUID NOT NULL REFERENCES customers(id),
    product_type      VARCHAR(20) NOT NULL
                      CHECK (product_type IN ('CONSUMER', 'MORTGAGE', 'BUSINESS', 'CREDIT_CARD')),
    amount            BIGINT NOT NULL,
    term              INT NOT NULL,                          -- tháng
    interest_rate     DECIMAL(5,2) NOT NULL,
    purpose           TEXT,
    status            VARCHAR(30) DEFAULT 'DRAFT'
                      CHECK (status IN ('DRAFT', 'SUBMITTED', 'PRE_SCREENING', 'AI_SCORING',
                                        'REVIEWING', 'APPROVED', 'CONDITIONALLY_APPROVED',
                                        'REJECTED', 'DISBURSED', 'CLOSED')),
    dti               DECIMAL(5,2),
    ltv               DECIMAL(5,2),
    collateral_type   VARCHAR(100),
    collateral_value  BIGINT,
    assigned_analyst  VARCHAR(255),
    assigned_officer  VARCHAR(255),
    ai_score_id       UUID,
    prescreen_result  JSONB,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

CREATE INDEX idx_loans_customer ON loans(customer_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_product ON loans(product_type);
CREATE INDEX idx_loans_created ON loans(created_at DESC);
```

### Bảng `loan_timeline`
```sql
CREATE TABLE loan_timeline (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id   UUID NOT NULL REFERENCES loans(id),
    action    VARCHAR(255) NOT NULL,
    actor     VARCHAR(255) NOT NULL,
    details   TEXT,
    status    VARCHAR(30),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_loan ON loan_timeline(loan_id, timestamp DESC);
```

### Bảng `sla_metrics`
```sql
CREATE TABLE sla_metrics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage           VARCHAR(100) NOT NULL,
    target_hours    DECIMAL(8,2) NOT NULL,
    actual_hours    DECIMAL(8,2) NOT NULL,
    on_time_rate    DECIMAL(5,2),
    total_processed INT DEFAULT 0,
    period          VARCHAR(20) NOT NULL,                  -- 2026-02
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Scoring Service DB (Redis + PostgreSQL)

### Bảng `scoring_results`
```sql
CREATE TABLE scoring_results (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id          UUID NOT NULL REFERENCES loans(id),
    total_score      INT NOT NULL,
    risk_grade       VARCHAR(20),
    recommendation   VARCHAR(20) CHECK (recommendation IN ('APPROVE', 'CONDITIONAL', 'REJECT', 'MANUAL_REVIEW')),
    components       JSONB NOT NULL,
    dimensions       JSONB NOT NULL,
    overridden       BOOLEAN DEFAULT FALSE,
    override_by      VARCHAR(255),
    override_reason  TEXT,
    scored_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scoring_loan ON scoring_results(loan_id);
```

### Redis Keys
```
scoring:cache:{loanId}      → JSON scoring result (TTL 30m)
scoring:rate:{userId}       → Rate limit counter (TTL 1m)
feature:store:{customerId}  → Feature vector cache (TTL 24h)
```

---

## 5. Workflow Engine DB

### Bảng `workflow_tasks`
```sql
CREATE TABLE workflow_tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id       UUID NOT NULL REFERENCES loans(id),
    task_type     VARCHAR(30) NOT NULL
                  CHECK (task_type IN ('PRE_SCREEN', 'AI_SCORING', 'APPRAISAL', 'APPROVAL', 'DISBURSEMENT')),
    status        VARCHAR(20) DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'EXPIRED')),
    assignee      VARCHAR(255) NOT NULL,
    priority      VARCHAR(10) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    sla_deadline  TIMESTAMPTZ NOT NULL,
    completed_at  TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_assignee ON workflow_tasks(assignee, status);
CREATE INDEX idx_tasks_sla ON workflow_tasks(sla_deadline) WHERE status IN ('PENDING', 'IN_PROGRESS');
```

### Bảng `approvals`
```sql
CREATE TABLE approvals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id         UUID NOT NULL REFERENCES workflow_tasks(id),
    loan_id         UUID NOT NULL REFERENCES loans(id),
    decision        VARCHAR(20) NOT NULL CHECK (decision IN ('APPROVE', 'REJECT', 'RETURN')),
    approved_amount BIGINT,
    conditions      TEXT[],
    note            TEXT NOT NULL,
    signature_hash  VARCHAR(128),
    signer_id       UUID NOT NULL,
    signed_at       TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 6. Notification Service DB

### Bảng `notifications`
```sql
CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL,
    type        VARCHAR(20) NOT NULL CHECK (type IN ('EWS', 'MODEL', 'LOAN', 'COMPLIANCE', 'SYSTEM')),
    severity    VARCHAR(10) NOT NULL CHECK (severity IN ('CRITICAL', 'WARNING', 'INFO')),
    title       VARCHAR(500) NOT NULL,
    message     TEXT NOT NULL,
    action_url  VARCHAR(500),
    read        BOOLEAN DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notif_user_unread ON notifications(user_id) WHERE read = FALSE;
CREATE INDEX idx_notif_created ON notifications(created_at DESC);
```

---

## 7. Admin Service DB

### Bảng `users`
```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50) UNIQUE NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(30) NOT NULL
                  CHECK (role IN ('CREDIT_ANALYST', 'CREDIT_OFFICER', 'CREDIT_MANAGER',
                                  'RISK_MANAGER', 'DATA_SCIENTIST', 'COMPLIANCE_OFFICER',
                                  'SYSTEM_ADMIN', 'CUSTOMER_SERVICE')),
    department    VARCHAR(100),
    is_active     BOOLEAN DEFAULT TRUE,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng `audit_logs`
```sql
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(50) NOT NULL,         -- CREATE, UPDATE, DELETE, LOGIN, APPROVE, REJECT
    entity_type VARCHAR(50) NOT NULL,         -- CUSTOMER, LOAN, MODEL, USER, CONFIG
    entity_id   VARCHAR(100),
    old_value   JSONB,
    new_value   JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```

---

## 8. Compliance Service DB

### Bảng `compliance_reports`
```sql
CREATE TABLE compliance_reports (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(500) NOT NULL,
    type         VARCHAR(10) NOT NULL CHECK (type IN ('BC001', 'BC002', 'BC003', 'BC004', 'BC005')),
    period       VARCHAR(20) NOT NULL,
    format       VARCHAR(10) CHECK (format IN ('PDF', 'Excel', 'Both')),
    status       VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('Draft', 'Generating', 'Ready', 'Archived')),
    file_url     TEXT,                        -- MinIO path
    file_size    VARCHAR(20),
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 9. Monitoring Service DB

### Bảng `adversarial_attacks`
```sql
CREATE TABLE adversarial_attacks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attack_type  VARCHAR(20) NOT NULL CHECK (attack_type IN ('FGSM', 'PGD', 'C&W', 'DeepFool', 'BIM')),
    target_model VARCHAR(100) NOT NULL,
    severity     VARCHAR(10) NOT NULL CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
    epsilon      DECIMAL(5,4),
    blocked      BOOLEAN DEFAULT TRUE,
    source_ip    INET,
    detected_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### Bảng `drift_snapshots`
```sql
CREATE TABLE drift_snapshots (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id       VARCHAR(10) NOT NULL,
    feature_name   VARCHAR(100) NOT NULL,
    psi            DECIMAL(6,4) NOT NULL,
    kl_divergence  DECIMAL(6,4),
    js_distance    DECIMAL(6,4),
    status         VARCHAR(10) CHECK (status IN ('STABLE', 'WATCH', 'DRIFT')),
    snapshot_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_drift_model ON drift_snapshots(model_id, snapshot_at DESC);
```

---

## 10. ER Diagram (quan hệ chính)

```
customers ─────────┐
    │               │
    │ 1:N           │ 1:N
    ▼               ▼
customer_documents  loans ──────────────┐
                      │                  │
                      │ 1:N     1:1      │ 1:N
                      ▼          ▼       ▼
                loan_timeline  scoring_results  workflow_tasks
                                                    │
                                                    │ 1:1
                                                    ▼
                                                 approvals

users ──────────┐
    │            │
    │ 1:N        │ 1:N
    ▼            ▼
audit_logs    notifications
```
