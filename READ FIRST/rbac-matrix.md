# RBAC Matrix — CDSS Phân Quyền 3 Lớp

---

## 1. Lớp 1: UI Sidebar (Frontend)

Mỗi menu item có thuộc tính `roles[]`. Chỉ hiển thị nếu user có role phù hợp.

| Module | ANALYST | OFFICER | MANAGER | RISK_MGR | DS | COMPLIANCE | ADMIN | CS |
|--------|:-------:|:-------:|:-------:|:--------:|:--:|:----------:|:-----:|:--:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Hồ sơ KH (CRM) | ✅ | ✅ | ✅ | — | — | — | ✅ | ✅ |
| Đơn vay | ✅ | ✅ | ✅ | — | — | — | ✅ | — |
| AI Scoring | ✅ | — | ✅ | ✅ | ✅ | — | ✅ | — |
| AutoML | — | — | — | — | ✅ | — | ✅ | — |
| Model Registry | — | — | — | ✅ | ✅ | — | ✅ | — |
| Fairness & Bias | — | — | — | ✅ | ✅ | ✅ | ✅ | — |
| XAI | — | — | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Adversarial | — | — | — | ✅ | ✅ | — | ✅ | — |
| Monitoring | — | — | — | ✅ | ✅ | — | ✅ | — |
| Workflow | — | — | ✅ | ✅ | — | — | ✅ | — |
| Portfolio | — | — | ✅ | ✅ | — | — | ✅ | — |
| Compliance | — | — | — | ✅ | — | ✅ | ✅ | — |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | — | — | — | — | — | — | ✅ | — |

---

## 2. Lớp 2: API Endpoint (Backend)

API Gateway kiểm tra JWT role trước khi forward request.

| Endpoint Group | Allowed Roles | Reject → |
|---|---|---|
| `GET /customers` | ANALYST, OFFICER, MANAGER, ADMIN, CS | 403 Forbidden |
| `POST /customers` | ANALYST, OFFICER, ADMIN | 403 |
| `POST /customers/:id/ekyc` | ANALYST, OFFICER | 403 |
| `GET /loans` | ANALYST, OFFICER, MANAGER, ADMIN | 403 |
| `POST /loans` | ANALYST, OFFICER | 403 |
| `POST /loans/:id/submit` | ANALYST | 403 |
| `PUT /loans/:id/status` | OFFICER, MANAGER | 403 |
| `POST /scoring/predict` | ANALYST, OFFICER, MANAGER | 403 |
| `POST /scoring/:id/override` | MANAGER only | 403 |
| `POST /scoring/batch` | MANAGER, DS | 403 |
| `GET /workflow/tasks` | OFFICER, MANAGER | 403 |
| `POST /workflow/tasks/:id/approve` | OFFICER (≤500M), MANAGER (unlimited) | 403 |
| `POST /automl/jobs` | DS only | 403 |
| `POST /models/:id/deploy` | DS only | 403 |
| `POST /fairness/evaluate` | DS, RISK_MGR, COMPLIANCE | 403 |
| `POST /compliance/reports/generate` | COMPLIANCE only | 403 |
| `POST /portfolio/stress-test` | RISK_MGR only | 403 |
| `GET /admin/users` | ADMIN only | 403 |
| `PUT /admin/config` | ADMIN only | 403 |

---

## 3. Lớp 3: Data-level (Row/Column)

| Rule | Mô tả |
|------|-------|
| Analyst chỉ thấy hồ sơ được assign | `WHERE assigned_analyst = :userId` |
| Officer thấy hồ sơ trong phòng | `WHERE department = :userDept` |
| Manager thấy tất cả hồ sơ | Không filter |
| CS chỉ thấy thông tin cơ bản KH | Ẩn fields: `internalScore`, `creditLimit`, `cicScore` |
| CCCD masking cho CS | `001200012***` — chỉ hiển thị 9 ký tự đầu |
| Audit log: chỉ Admin + Compliance xem | Filter by role |

---

## 4. Phê duyệt theo hạn mức

| Hạn mức khoản vay | Ai phê duyệt |
|---|---|
| ≤ 200M VNĐ | Credit Officer |
| 200M – 2 tỷ VNĐ | Credit Manager |
| > 2 tỷ VNĐ | Risk Manager + Credit Manager (dual approval) |
| Override AI score | Credit Manager only |

---

## 5. Frontend Implementation

```typescript
// auth.service.ts
hasRole(allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(this.user()?.role!);
}

// role.guard.ts
canActivate(route: ActivatedRouteSnapshot): boolean {
  const roles = route.data['roles'] as UserRole[];
  return this.auth.hasRole(roles);
}

// main-layout.component.ts — sidebar filtering
navItems = [
  { label: 'AutoML', route: '/automl', roles: ['DATA_SCIENTIST', 'SYSTEM_ADMIN'] },
  // ...
];
filteredNavItems() {
  return this.navItems.filter(item => !item.roles || this.auth.hasRole(item.roles));
}
```
