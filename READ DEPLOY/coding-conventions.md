# Coding Conventions — CDSS Project

---

## 1. Git Workflow

### Branching Model (Git Flow)
```
main          ← Production release
├── develop   ← Integration branch
│   ├── feature/CDSS-123-add-ekyc
│   ├── feature/CDSS-456-stress-test-api
│   └── feature/CDSS-789-drift-detection
├── release/v1.2.0
├── hotfix/fix-scoring-timeout
```

### Branch Naming
```
feature/CDSS-{ticket}-{short-description}
bugfix/CDSS-{ticket}-{short-description}
hotfix/{short-description}
release/v{major}.{minor}.{patch}
```

### Commit Message (Conventional Commits)
```
feat(loan-service): add pre-screening API endpoint
fix(scoring): handle timeout from Seldon Core
docs(api): update scoring request schema
refactor(auth): extract JWT validation middleware
test(customer): add unit tests for ekyc service
chore(docker): upgrade postgres to 16.2
perf(query): add index on loans.status
```

### PR Checklist
- [ ] Code compiles / builds without errors
- [ ] Unit tests pass
- [ ] No lint warnings
- [ ] API contract documented (nếu thay đổi API)
- [ ] Migration file included (nếu thay đổi DB)
- [ ] Reviewed by ≥ 1 team member

---

## 2. Go (Backend Services)

### Project Structure (mỗi service)
```
service-name/
├── main.go                    Entrypoint
├── config/config.yaml         Config
├── internal/                  Private code
│   ├── domain/                Entities, value objects
│   ├── repository/            DB access (interface + impl)
│   ├── service/               Business logic
│   └── handler/               HTTP handlers (Echo)
├── migrations/                SQL migrations
└── tests/                     Tests
```

### Naming
```go
// File: snake_case.go
// Package: lowercase, no underscores
// Exported: PascalCase
// Unexported: camelCase
// Constants: PascalCase hoặc ALL_CAPS
// Interface: Verb + "er" (Reader, Scorer, Validator)

type LoanRepository interface {
    FindByID(ctx context.Context, id uuid.UUID) (*Loan, error)
    FindAll(ctx context.Context, filter LoanFilter) ([]Loan, error)
    Create(ctx context.Context, loan *Loan) error
    Update(ctx context.Context, loan *Loan) error
}

type loanRepositoryPostgres struct {
    db *sql.DB
}
```

### Error Handling
```go
// Dùng custom error types
type AppError struct {
    Code    string `json:"code"`
    Message string `json:"message"`
    Status  int    `json:"-"`
}

func (e *AppError) Error() string { return e.Message }

// Ví dụ
var ErrLoanNotFound = &AppError{Code: "LOAN_NOT_FOUND", Message: "Không tìm thấy hồ sơ", Status: 404}
```

### Logging
```go
// Dùng structured logging (zerolog hoặc zap)
log.Info().
    Str("loanId", loanID).
    Int("score", 731).
    Dur("latency", elapsed).
    Msg("Scoring completed")
```

---

## 3. Angular (Frontend)

### Naming
```
component:     kebab-case.component.ts     loan-list.component.ts
service:       kebab-case.service.ts       mock-data.service.ts
guard:         kebab-case.guard.ts         auth.guard.ts
model:         kebab-case.models.ts        data.models.ts
store action:  kebab-case.actions.ts       loans.actions.ts
store reducer: kebab-case.reducer.ts       loans.reducer.ts
```

### Component Structure
```typescript
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, ...],
  template: `...`,
  styles: [`...`]
})
export class FeatureNameComponent implements OnInit {
  // 1. Properties (signals, fields)
  // 2. Constructor (DI)
  // 3. Lifecycle hooks (ngOnInit, ngOnDestroy)
  // 4. Public methods
  // 5. Private methods
}
```

### Quy tắc chung
- Luôn dùng **standalone components** (Angular 17+)
- Dùng **signals** thay BehaviorSubject khi có thể
- Lazy load tất cả feature modules
- Template inline OK nếu < 100 dòng, tách file nếu > 100 dòng
- Không dùng `any` — define interface trong `data.models.ts`

---

## 4. Python (AI Services)

### Naming
```python
# File: snake_case.py
# Class: PascalCase
# Function: snake_case
# Constant: UPPER_SNAKE_CASE
# Variable: snake_case

class FairnessService:
    def evaluate_model(self, model_id: str, dataset: pd.DataFrame) -> FairnessResult:
        pass
```

### FastAPI Structure
```python
# main.py
app = FastAPI(title="CDSS Fairness API", version="1.0.0")
app.include_router(fairness_router, prefix="/fairness", tags=["Fairness"])

# routes/fairness_routes.py
@router.post("/evaluate", response_model=FairnessResult)
async def evaluate(request: FairnessRequest):
    return await fairness_service.evaluate(request)
```

### Type Hints
```python
# Bắt buộc dùng type hints cho tất cả functions
def calculate_psi(
    expected: np.ndarray,
    actual: np.ndarray,
    bins: int = 10
) -> float:
    ...
```

---

## 5. SQL Migrations

### Naming
```
001_create_customers.up.sql
001_create_customers.down.sql
002_create_documents.up.sql
002_create_documents.down.sql
```

### Quy tắc
- Mỗi migration có file `.up.sql` (apply) và `.down.sql` (rollback)
- Không sửa migration đã chạy — tạo migration mới
- Dùng `golang-migrate` hoặc `goose` để chạy
