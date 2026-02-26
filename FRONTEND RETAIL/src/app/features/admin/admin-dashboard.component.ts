import { Component } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule } from '@angular/router'; import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-dashboard', standalone: true, imports: [CommonModule, RouterModule, FormsModule],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Admin Dashboard</h1><p class="page-subtitle">Module AD001-AD005 · System Config · RBAC · Keycloak SSO · Audit Log</p></div></div>
    <div class="kpi-grid">
      <div class="kpi-card kpi-blue" style="padding:16px"><div class="kpi-label">Active Users</div><div class="kpi-value" style="font-size:1.6rem">24</div><div class="kpi-trend">8 online now</div></div>
      <div class="kpi-card kpi-green" style="padding:16px"><div class="kpi-label">System Uptime</div><div class="kpi-value" style="font-size:1.6rem">99.8%</div><div class="kpi-trend trend-up"><i class="fas fa-arrow-up"></i> Last 30 days</div></div>
      <div class="kpi-card kpi-orange" style="padding:16px"><div class="kpi-label">API Calls Today</div><div class="kpi-value" style="font-size:1.6rem">8,452</div><div class="kpi-trend">REST+gRPC</div></div>
      <div class="kpi-card kpi-red" style="padding:16px"><div class="kpi-label">Error Rate</div><div class="kpi-value" style="font-size:1.6rem">0.3%</div><div class="kpi-trend trend-up"><i class="fas fa-arrow-down"></i> -0.1%</div></div>
    </div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="tab==='overview'" (click)="tab='overview'">Overview</div>
      <div class="tab-item" [class.active]="tab==='permissions'" (click)="tab='permissions'">Permission Matrix (AD002)</div>
      <div class="tab-item" [class.active]="tab==='config'" (click)="tab='config'">System Config (AD005)</div>
      <div class="tab-item" [class.active]="tab==='model-config'" (click)="tab='model-config'">Model Serving (AD003)</div>
      <div class="tab-item" [class.active]="tab==='audit'" (click)="tab='audit'">Audit Log (AD004)</div>
    </div>
    @if(tab==='overview'){<div class="row-flex">
      <div class="card col-6">
        <div class="card-header"><h3><i class="fas fa-server"></i> Service Health</h3></div>
        @for(s of services;track s.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border-light)"><div><strong>{{s.name}}</strong><br><small style="color:var(--text-tertiary)">{{s.endpoint}}</small></div><div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--font-mono);font-size:.82rem">{{s.latency}}ms</span><span class="badge" [class]="s.status==='UP'?'badge-success':'badge-danger'">{{s.status}}</span></div></div>}
      </div>
      <div class="card col-6">
        <div class="card-header"><h3><i class="fas fa-tools"></i> Quick Actions</h3></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <a routerLink="/admin/users" class="btn btn-secondary" style="padding:20px;text-align:center"><i class="fas fa-users" style="display:block;font-size:1.5rem;margin-bottom:8px"></i>User Management</a>
          <div class="btn btn-secondary" style="padding:20px;text-align:center" (click)="tab='permissions'"><i class="fas fa-key" style="display:block;font-size:1.5rem;margin-bottom:8px"></i>RBAC Matrix</div>
          <div class="btn btn-secondary" style="padding:20px;text-align:center" (click)="tab='config'"><i class="fas fa-cog" style="display:block;font-size:1.5rem;margin-bottom:8px"></i>System Config</div>
          <div class="btn btn-secondary" style="padding:20px;text-align:center" (click)="tab='audit'"><i class="fas fa-history" style="display:block;font-size:1.5rem;margin-bottom:8px"></i>Audit Log</div>
        </div>
      </div>
    </div>}
    @if(tab==='permissions'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-shield-alt"></i> Permission Matrix (AD002)</h3><span class="badge badge-tech">Keycloak RBAC</span></div>
      <div style="overflow-x:auto"><table class="data-table" style="font-size:.78rem"><thead><tr><th style="position:sticky;left:0;background:var(--bg-primary);z-index:1">Module / Tính năng</th>@for(r of roles;track r){<th style="text-align:center;min-width:85px">{{r}}</th>}</tr></thead><tbody>
        @for(p of permMatrix;track p.feature){<tr><td style="position:sticky;left:0;background:var(--bg-primary);z-index:1;font-weight:600">{{p.feature}}</td>@for(r of roles;track r){<td style="text-align:center"><span style="font-size:.75rem" [style.color]="p.perms[r]==='Full'?'var(--brand-success)':p.perms[r]==='View'?'var(--brand-accent)':p.perms[r]==='—'?'var(--text-tertiary)':'var(--brand-warning)'">{{p.perms[r]}}</span></td>}</tr>}
      </tbody></table></div>
      <div style="margin-top:12px;display:flex;gap:16px;font-size:.75rem;color:var(--text-tertiary)"><span><span style="color:var(--brand-success);font-weight:700">Full</span> = Full access</span><span><span style="color:var(--brand-warning);font-weight:700">Edit</span> = Edit assigned</span><span><span style="color:var(--brand-accent);font-weight:700">View</span> = Read only</span><span><span style="color:var(--text-tertiary)">—</span> = No access</span></div>
    </div>}
    @if(tab==='config'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-cog"></i> System Configuration (AD005)</h3><button class="btn btn-primary btn-sm"><i class="fas fa-save"></i> Save All</button></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div style="padding:16px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px"><i class="fas fa-chart-line" style="margin-right:6px;color:var(--brand-accent)"></i>Scoring Thresholds</h4>
          @for(t of scoringThresholds;track t.label){<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light)"><span>{{t.label}}</span><input type="number" [(ngModel)]="t.value" style="width:80px;padding:4px 8px;border:1px solid var(--border-light);border-radius:6px;text-align:center;font-weight:700"></div>}
        </div>
        <div style="padding:16px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px"><i class="fas fa-clock" style="margin-right:6px;color:var(--brand-accent)"></i>SLA Configuration</h4>
          @for(s of slaConfig;track s.label){<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light)"><span>{{s.label}}</span><input type="text" [(ngModel)]="s.value" style="width:100px;padding:4px 8px;border:1px solid var(--border-light);border-radius:6px;text-align:center"></div>}
        </div>
        <div style="padding:16px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px"><i class="fas fa-balance-scale" style="margin-right:6px;color:var(--brand-accent)"></i>Fairness Thresholds</h4>
          @for(f of fairnessConfig;track f.label){<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light)"><span>{{f.label}}</span><input type="number" [(ngModel)]="f.value" [step]="0.01" style="width:80px;padding:4px 8px;border:1px solid var(--border-light);border-radius:6px;text-align:center;font-weight:700"></div>}
        </div>
        <div style="padding:16px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px"><i class="fas fa-toggle-on" style="margin-right:6px;color:var(--brand-accent)"></i>Feature Flags</h4>
          @for(ff of featureFlags;track ff.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light)"><div><strong>{{ff.name}}</strong><br><small style="color:var(--text-tertiary)">{{ff.desc}}</small></div><label style="position:relative;display:inline-block;width:44px;height:24px"><input type="checkbox" [(ngModel)]="ff.enabled" style="opacity:0;width:0;height:0"><span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;border-radius:12px;transition:.3s" [style.background]="ff.enabled?'var(--brand-success)':'#CBD5E1'"></span></label></div>}
        </div>
      </div>
    </div>}
    @if(tab==='model-config'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-network-wired"></i> Model Serving Config (AD003)</h3></div>
      <table class="data-table"><thead><tr><th>Service</th><th>Protocol</th><th>Endpoint</th><th>Timeout</th><th>Retry</th><th>Circuit Breaker</th><th>Status</th><th></th></tr></thead><tbody>
        @for(m of modelEndpoints;track m.name){<tr><td><strong>{{m.name}}</strong></td><td><span class="badge badge-tech">{{m.protocol}}</span></td><td style="font-family:var(--font-mono);font-size:.82rem">{{m.endpoint}}</td><td><input type="number" [(ngModel)]="m.timeout" style="width:60px;padding:2px 6px;border:1px solid var(--border-light);border-radius:4px;text-align:center">ms</td><td><input type="number" [(ngModel)]="m.retry" style="width:40px;padding:2px 6px;border:1px solid var(--border-light);border-radius:4px;text-align:center"></td><td><span class="badge" [class]="m.circuitBreaker?'badge-success':'badge-warning'">{{m.circuitBreaker?'ON':'OFF'}}</span></td><td><span class="badge" [class]="m.status==='UP'?'badge-success':'badge-danger'">{{m.status}}</span></td><td><button class="btn btn-sm btn-secondary"><i class="fas fa-heartbeat"></i> Check</button></td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='audit'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-history"></i> Audit Log (AD004)</h3><div style="display:flex;gap:8px"><input type="text" placeholder="Search logs..." style="padding:6px 12px;border:1px solid var(--border-light);border-radius:8px;font-size:.82rem"><button class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Export</button></div></div>
      <table class="data-table"><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Entity</th><th>Detail</th><th>IP</th></tr></thead><tbody>
        @for(a of auditLogs;track a.ts){<tr><td style="font-size:.78rem;font-family:var(--font-mono)">{{a.ts}}</td><td><strong>{{a.user}}</strong></td><td><span class="badge" [class]="a.type==='CREATE'?'badge-success':a.type==='UPDATE'?'badge-info':a.type==='DELETE'?'badge-danger':'badge-warning'">{{a.type}}</span></td><td>{{a.entity}}</td><td style="font-size:.82rem">{{a.detail}}</td><td style="font-family:var(--font-mono);font-size:.78rem">{{a.ip}}</td></tr>}
      </tbody></table>
    </div>}
  </div>`, styles: ['']
})
export class AdminDashboardComponent {
  tab = 'overview';
  services = [{ name: 'Go+Gin API Gateway', endpoint: 'api.cdss.local:8080', latency: 12, status: 'UP' }, { name: 'Seldon Core (gRPC)', endpoint: 'seldon.cluster:9000', latency: 85, status: 'UP' }, { name: 'Kubeflow Serving', endpoint: 'kubeflow.cluster:9001', latency: 120, status: 'UP' }, { name: 'Keycloak SSO', endpoint: 'keycloak.cdss.local:8443', latency: 45, status: 'UP' }, { name: 'PostgreSQL', endpoint: 'pg.cdss.local:5432', latency: 3, status: 'UP' }, { name: 'Redis Cache', endpoint: 'redis.cdss.local:6379', latency: 1, status: 'UP' }, { name: 'Kafka Broker', endpoint: 'kafka.cdss.local:9092', latency: 8, status: 'UP' }, { name: 'MinIO Storage', endpoint: 'minio.cdss.local:9000', latency: 15, status: 'UP' }];
  roles = ['Analyst', 'Officer', 'Manager', 'Risk Mgr', 'Data Sci', 'Compliance', 'Admin'];
  permMatrix = [
    { feature: 'Hồ sơ KH', perms: { 'Analyst': 'Edit', 'Officer': 'View', 'Manager': 'View', 'Risk Mgr': 'View', 'Data Sci': '—', 'Compliance': 'View', 'Admin': 'Full' } },
    { feature: 'Tạo đơn vay', perms: { 'Analyst': 'Full', 'Officer': 'Full', 'Manager': 'Full', 'Risk Mgr': '—', 'Data Sci': '—', 'Compliance': '—', 'Admin': '—' } },
    { feature: 'Xem AI Score', perms: { 'Analyst': 'View', 'Officer': 'View', 'Manager': 'View', 'Risk Mgr': 'Full', 'Data Sci': 'Full', 'Compliance': 'View', 'Admin': '—' } },
    { feature: 'Override AI', perms: { 'Analyst': '≤500M', 'Officer': '≤2B', 'Manager': 'Full', 'Risk Mgr': '—', 'Data Sci': '—', 'Compliance': '—', 'Admin': '—' } },
    { feature: 'Phê duyệt', perms: { 'Analyst': 'Propose', 'Officer': '≤500M', 'Manager': '≤5B', 'Risk Mgr': '—', 'Data Sci': '—', 'Compliance': '—', 'Admin': '—' } },
    { feature: 'AutoML Jobs', perms: { 'Analyst': '—', 'Officer': '—', 'Manager': '—', 'Risk Mgr': 'View', 'Data Sci': 'Full', 'Compliance': '—', 'Admin': '—' } },
    { feature: 'Model Deploy', perms: { 'Analyst': '—', 'Officer': '—', 'Manager': '—', 'Risk Mgr': 'Approve', 'Data Sci': 'Submit', 'Compliance': '—', 'Admin': 'Config' } },
    { feature: 'Fairness', perms: { 'Analyst': 'View', 'Officer': 'View', 'Manager': 'View', 'Risk Mgr': 'Full', 'Data Sci': 'Full', 'Compliance': 'Full', 'Admin': '—' } },
    { feature: 'XAI', perms: { 'Analyst': 'View', 'Officer': 'View', 'Manager': 'View', 'Risk Mgr': 'Full', 'Data Sci': 'Full', 'Compliance': 'View', 'Admin': '—' } },
    { feature: 'Portfolio', perms: { 'Analyst': '—', 'Officer': 'View', 'Manager': 'View', 'Risk Mgr': 'Full', 'Data Sci': 'View', 'Compliance': 'View', 'Admin': '—' } },
    { feature: 'System Config', perms: { 'Analyst': '—', 'Officer': '—', 'Manager': '—', 'Risk Mgr': '—', 'Data Sci': '—', 'Compliance': '—', 'Admin': 'Full' } },
    { feature: 'User Mgmt', perms: { 'Analyst': '—', 'Officer': '—', 'Manager': '—', 'Risk Mgr': '—', 'Data Sci': '—', 'Compliance': '—', 'Admin': 'Full' } }
  ];
  scoringThresholds = [{ label: 'Auto-Approve Score', value: 750 }, { label: 'Auto-Reject Score', value: 400 }, { label: 'PSI Alert Threshold', value: 0.20 }, { label: 'Max DTI Allowed', value: 45 }];
  slaConfig = [{ label: 'Pre-screening', value: '30 giây' }, { label: 'AI Scoring', value: '3 phút' }, { label: 'Thẩm định', value: '4 giờ' }, { label: 'Phê duyệt (≤500M)', value: '2 giờ' }, { label: 'Phê duyệt (>500M)', value: '1 ngày' }];
  fairnessConfig = [{ label: 'Min Disparate Impact', value: 0.80 }, { label: 'Max Stat Parity Diff', value: 0.10 }, { label: 'Max Equal Opp Diff', value: 0.10 }, { label: 'Max Theil Index', value: 0.15 }];
  featureFlags = [{ name: 'AI Auto-Scoring', desc: 'Tự động scoring khi đủ điều kiện', enabled: true }, { name: 'Adversarial Defense', desc: 'Check adversarial trước scoring', enabled: true }, { name: 'Fairness Gate', desc: 'Block deploy khi fairness FAIL', enabled: true }, { name: 'EWS Alerts', desc: 'Push EWS warnings real-time', enabled: true }, { name: 'Model A/B Testing', desc: 'Enable champion-challenger', enabled: false }];
  modelEndpoints = [{ name: 'Seldon Core - Behavioral', protocol: 'gRPC', endpoint: 'seldon.cluster:9000', timeout: 5000, retry: 3, circuitBreaker: true, status: 'UP' }, { name: 'Kubeflow - Credit Risk', protocol: 'gRPC', endpoint: 'kubeflow.cluster:9001', timeout: 5000, retry: 3, circuitBreaker: true, status: 'UP' }, { name: 'SageMaker - Fraud', protocol: 'REST', endpoint: 'sagemaker.aws/predict', timeout: 10000, retry: 2, circuitBreaker: true, status: 'UP' }, { name: 'PredictionIO - Segment', protocol: 'REST', endpoint: 'predictionio:8000', timeout: 8000, retry: 2, circuitBreaker: false, status: 'UP' }, { name: 'AIF360 - Fairness', protocol: 'REST', endpoint: 'aif360.svc:5000', timeout: 15000, retry: 1, circuitBreaker: false, status: 'UP' }, { name: 'AIX360 - XAI', protocol: 'REST', endpoint: 'aix360.svc:5001', timeout: 15000, retry: 1, circuitBreaker: false, status: 'UP' }];
  auditLogs = [{ ts: '25/02/2026 09:45:22', user: 'officer_le', type: 'UPDATE', entity: 'LoanApplication', detail: 'Approved LV-2435 (731 pts)', ip: '10.0.1.45' }, { ts: '25/02/2026 09:30:15', user: 'manager_pham', type: 'UPDATE', entity: 'ScoringResult', detail: 'Override AI score for LV-2439', ip: '10.0.1.22' }, { ts: '25/02/2026 08:00:00', user: 'ds_nguyen', type: 'CREATE', entity: 'AIModel', detail: 'Deployed XGBoost v3.2.1 via Seldon', ip: '10.0.2.15' }, { ts: '24/02/2026 16:30:00', user: 'analyst_tran', type: 'READ', entity: 'Customer', detail: 'Exported 150 customer records', ip: '10.0.1.33' }, { ts: '24/02/2026 14:00:00', user: 'system', type: 'CREATE', entity: 'FairnessReport', detail: 'Auto-generated monthly fairness audit', ip: '10.0.0.1' }, { ts: '24/02/2026 11:00:00', user: 'admin', type: 'UPDATE', entity: 'SystemConfig', detail: 'Updated scoring threshold: 750→730', ip: '10.0.0.5' }, { ts: '23/02/2026 22:00:00', user: 'system', type: 'UPDATE', entity: 'EWSAlert', detail: 'Generated 4 new EWS alerts', ip: '10.0.0.1' }, { ts: '23/02/2026 16:00:00', user: 'compliance_vu', type: 'READ', entity: 'AuditLog', detail: 'Downloaded audit log Q4/2025', ip: '10.0.1.50' }];
}
