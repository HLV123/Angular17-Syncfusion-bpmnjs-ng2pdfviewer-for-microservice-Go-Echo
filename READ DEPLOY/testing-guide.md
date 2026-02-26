# Testing Guide — CDSS Project

---

## 1. Testing Pyramid

```
         ┌───────┐
         │  E2E  │  5%    Cypress (login → scoring → approve → disburse)
        ┌┴───────┴┐
        │  Integ  │ 20%   Testcontainers (Go), HttpTestingModule (Angular)
       ┌┴─────────┴┐
       │   Unit    │ 70%   Go testing, Jest (Angular), pytest (Python)
      ┌┴───────────┴┐
      │   Static   │  5%   ESLint, golangci-lint, mypy, Prettier
      └─────────────┘
```

### Coverage Targets

| Layer | Target | Tool |
|-------|:------:|------|
| Go Services | ≥ 80% | `go test -cover` |
| Angular | ≥ 70% | Jest + `ng test --code-coverage` |
| Python AI | ≥ 75% | pytest-cov |
| E2E | Critical flows only | Cypress |

---

## 2. Go Backend Tests

### Unit Test
```go
// tests/loan_service_test.go
func TestCreateLoan_ValidInput(t *testing.T) {
    repo := mocks.NewMockLoanRepository()
    svc := service.NewLoanService(repo)

    loan, err := svc.Create(ctx, &domain.CreateLoanRequest{
        CustomerID:  "KH001",
        ProductType: "CONSUMER",
        Amount:      350000000,
        Term:        36,
    })

    assert.NoError(t, err)
    assert.Equal(t, "DRAFT", loan.Status)
    assert.NotEmpty(t, loan.LoanCode)
}

func TestCreateLoan_InvalidAmount(t *testing.T) {
    repo := mocks.NewMockLoanRepository()
    svc := service.NewLoanService(repo)

    _, err := svc.Create(ctx, &domain.CreateLoanRequest{
        Amount: -100,
    })

    assert.Error(t, err)
    assert.Equal(t, "INVALID_AMOUNT", err.(*AppError).Code)
}
```

### Integration Test (Testcontainers)
```go
func TestLoanRepository_Integration(t *testing.T) {
    ctx := context.Background()
    pgContainer, _ := postgres.Run(ctx, "postgres:16-alpine",
        postgres.WithDatabase("test_db"),
        postgres.WithUsername("test"),
        postgres.WithPassword("test"),
    )
    defer pgContainer.Terminate(ctx)

    connStr, _ := pgContainer.ConnectionString(ctx)
    db, _ := sql.Open("postgres", connStr)
    repo := repository.NewLoanRepositoryPostgres(db)

    // Run migrations
    migrate.Up(db, "../../migrations")

    // Test
    loan := &domain.Loan{CustomerID: "KH001", Amount: 350000000}
    err := repo.Create(ctx, loan)
    assert.NoError(t, err)

    found, err := repo.FindByID(ctx, loan.ID)
    assert.NoError(t, err)
    assert.Equal(t, int64(350000000), found.Amount)
}
```

### Chạy tests
```powershell
# Unit tests toàn bộ service
cd services/loan-service
go test ./... -v

# Với coverage
go test ./... -cover -coverprofile=coverage.out
go tool cover -html=coverage.out

# Chỉ 1 test
go test -run TestCreateLoan_ValidInput ./internal/service/
```

---

## 3. Angular Frontend Tests

### Component Test (Jest)
```typescript
describe('LoanListComponent', () => {
  let component: LoanListComponent;
  let mockDataService: MockDataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanListComponent],
      providers: [MockDataService]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoanListComponent);
    component = fixture.componentInstance;
    mockDataService = TestBed.inject(MockDataService);
    fixture.detectChanges();
  });

  it('should load loans on init', () => {
    expect(component.all.length).toBe(8);
    expect(component.filtered.length).toBe(8);
  });

  it('should filter by product type', () => {
    component.productF = 'MORTGAGE';
    component.doFilter();
    expect(component.filtered.every(l => l.productType === 'MORTGAGE')).toBeTruthy();
  });

  it('should filter by status', () => {
    component.statusF = 'REVIEWING';
    component.doFilter();
    expect(component.filtered.every(l => l.status === 'REVIEWING')).toBeTruthy();
  });
});
```

### Chạy tests
```powershell
# Tất cả tests
ng test

# Với coverage
ng test --code-coverage

# Watch mode
ng test --watch
```

---

## 4. Python AI Tests

### Unit Test (pytest)
```python
# tests/test_fairness.py
import pytest
from app.services.fairness_service import FairnessService

@pytest.fixture
def service():
    return FairnessService()

def test_disparate_impact_pass(service):
    result = service.evaluate(
        predictions=[1,1,1,0,1,1,1,0,1,1],
        protected=[0,0,0,0,0,1,1,1,1,1],
    )
    assert result.disparate_impact >= 0.8
    assert result.status == "PASS"

def test_disparate_impact_fail(service):
    result = service.evaluate(
        predictions=[1,1,1,1,1,0,0,0,0,0],
        protected=[0,0,0,0,0,1,1,1,1,1],
    )
    assert result.disparate_impact < 0.8
    assert result.status == "FAIL"
```

### Chạy tests
```powershell
cd ai-services/fairness-api
pytest -v --cov=app --cov-report=html
```

---

## 5. E2E Tests (Cypress)

### Critical Flows

| # | Flow | Steps |
|:-:|------|-------|
| 1 | Login → Dashboard | Login → verify KPI cards visible |
| 2 | Create Loan | Login → New loan → Fill form → Submit |
| 3 | AI Scoring | Open loan → Click "AI Score" → Verify result |
| 4 | Approve Loan | Workflow → Select task → Sign → Approve |
| 5 | EWS Alert | Monitoring → Verify real-time alert appears |

### Chạy E2E
```powershell
# Interactive mode
npx cypress open

# Headless CI mode
npx cypress run
```

---

## 6. CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  go-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with: { go-version: '1.22' }
      - run: |
          cd services/loan-service
          go test ./... -cover -coverprofile=coverage.out
      - uses: codecov/codecov-action@v4

  angular-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: |
          cd "retail frontend"
          npm ci
          npx ng test --watch=false --code-coverage

  python-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: '3.11' }
      - run: |
          cd ai-services/fairness-api
          pip install -r requirements.txt
          pytest --cov=app
```
