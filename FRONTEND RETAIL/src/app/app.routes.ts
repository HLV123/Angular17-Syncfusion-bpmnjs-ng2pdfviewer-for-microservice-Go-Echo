import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customer/customer-list.component').then(m => m.CustomerListComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_ANALYST', 'CREDIT_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN', 'CUSTOMER_SERVICE'] }
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./features/customer/customer-detail.component').then(m => m.CustomerDetailComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_ANALYST', 'CREDIT_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN', 'CUSTOMER_SERVICE'] }
      },
      {
        path: 'loans',
        loadComponent: () => import('./features/loan-application/loan-list.component').then(m => m.LoanListComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_ANALYST', 'CREDIT_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'loans/new',
        loadComponent: () => import('./features/loan-application/loan-wizard.component').then(m => m.LoanWizardComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'loans/:id',
        loadComponent: () => import('./features/loan-application/loan-detail.component').then(m => m.LoanDetailComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_ANALYST', 'CREDIT_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'ai-scoring',
        loadComponent: () => import('./features/ai-scoring/scoring-dashboard.component').then(m => m.ScoringDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_ANALYST', 'CREDIT_MANAGER', 'RISK_MANAGER', 'DATA_SCIENTIST', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'ai-scoring/:loanId',
        loadComponent: () => import('./features/ai-scoring/scoring-result.component').then(m => m.ScoringResultComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_ANALYST', 'CREDIT_MANAGER', 'RISK_MANAGER', 'DATA_SCIENTIST', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'automl',
        loadComponent: () => import('./features/automl/automl-dashboard.component').then(m => m.AutoMLDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['DATA_SCIENTIST', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'model-registry',
        loadComponent: () => import('./features/model-governance/model-registry.component').then(m => m.ModelRegistryComponent),
        canActivate: [RoleGuard], data: { roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'model-registry/:id',
        loadComponent: () => import('./features/model-governance/model-detail.component').then(m => m.ModelDetailComponent),
        canActivate: [RoleGuard], data: { roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'fairness',
        loadComponent: () => import('./features/fairness/fairness-dashboard.component').then(m => m.FairnessDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'explainability',
        loadComponent: () => import('./features/explainability/explainability-dashboard.component').then(m => m.ExplainabilityDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'CREDIT_MANAGER', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'adversarial',
        loadComponent: () => import('./features/adversarial/adversarial-dashboard.component').then(m => m.AdversarialDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'monitoring',
        loadComponent: () => import('./features/monitoring/monitoring-dashboard.component').then(m => m.MonitoringDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'workflow',
        loadComponent: () => import('./features/workflow/workflow-dashboard.component').then(m => m.WorkflowDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_MANAGER', 'RISK_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'compliance',
        loadComponent: () => import('./features/compliance/compliance-dashboard.component').then(m => m.ComplianceDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['COMPLIANCE_OFFICER', 'RISK_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'portfolio',
        loadComponent: () => import('./features/portfolio/portfolio-dashboard.component').then(m => m.PortfolioDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['CREDIT_MANAGER', 'RISK_MANAGER', 'SYSTEM_ADMIN'] }
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notification-center.component').then(m => m.NotificationCenterComponent)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [RoleGuard], data: { roles: ['SYSTEM_ADMIN'] }
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./features/admin/user-management.component').then(m => m.UserManagementComponent),
        canActivate: [RoleGuard], data: { roles: ['SYSTEM_ADMIN'] }
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
