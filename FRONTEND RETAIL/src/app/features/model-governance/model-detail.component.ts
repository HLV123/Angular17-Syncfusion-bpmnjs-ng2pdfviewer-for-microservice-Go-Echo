import { Component, OnInit, signal } from '@angular/core'; import { CommonModule } from '@angular/common'; import { ActivatedRoute, RouterModule } from '@angular/router'; import { FormsModule } from '@angular/forms'; import { MockDataService } from '../../core/services/mock-data.service'; import { AIModel } from '../../core/models/data.models';
@Component({
  selector: 'app-model-detail', standalone: true, imports: [CommonModule, RouterModule, FormsModule],
  template: `<div class="page-container">@if(model){
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px"><a routerLink="/model-registry" class="btn btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></a><div style="flex:1"><h1 class="page-title">{{model.name}} {{model.version}}</h1><p class="page-subtitle" style="margin:0">{{model.platform}} · {{model.type}} · by {{model.createdBy}}</p></div><span class="badge" [class]="model.status==='PRODUCTION'?'badge-success':'badge-info'" style="font-size:.88rem;padding:8px 18px">{{model.status}}</span></div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="tab==='metrics'" (click)="tab='metrics'">Metrics</div>
      <div class="tab-item" [class.active]="tab==='lineage'" (click)="tab='lineage'">Lineage (MG002)</div>
      <div class="tab-item" [class.active]="tab==='deploy'" (click)="tab='deploy'">Deploy (MG003)</div>
      <div class="tab-item" [class.active]="tab==='challenger'" (click)="tab='challenger'">Champion-Challenger</div>
      <div class="tab-item" [class.active]="tab==='audit'" (click)="tab='audit'">Audit (MG005)</div>
    </div>
    @if(tab==='metrics'){<div class="row-flex">
      <div class="card col-8">
        <div class="card-header"><h3><i class="fas fa-chart-bar"></i> Performance Metrics</h3><span class="badge badge-tech">ModelDB REST</span></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px">
          <div style="text-align:center;padding:20px;background:var(--bg-tertiary);border-radius:12px"><div style="font-size:2.2rem;font-weight:800;color:var(--brand-accent)">{{model.metrics.auc}}</div><small style="color:var(--text-tertiary)">AUC-ROC</small></div>
          <div style="text-align:center;padding:20px;background:var(--bg-tertiary);border-radius:12px"><div style="font-size:2.2rem;font-weight:800;color:var(--brand-success)">{{model.metrics.precision}}</div><small style="color:var(--text-tertiary)">Precision</small></div>
          <div style="text-align:center;padding:20px;background:var(--bg-tertiary);border-radius:12px"><div style="font-size:2.2rem;font-weight:800;color:var(--brand-info)">{{model.metrics.recall}}</div><small style="color:var(--text-tertiary)">Recall</small></div>
          <div style="text-align:center;padding:16px;background:var(--bg-tertiary);border-radius:12px"><div style="font-size:1.6rem;font-weight:700">{{model.metrics.f1}}</div><small>F1 Score</small></div>
          <div style="text-align:center;padding:16px;background:var(--bg-tertiary);border-radius:12px"><div style="font-size:1.6rem;font-weight:700">{{model.metrics.ks}}</div><small>KS Statistic</small></div>
          <div style="text-align:center;padding:16px;background:var(--bg-tertiary);border-radius:12px"><div style="font-size:1.6rem;font-weight:700">{{model.metrics.gini}}</div><small>Gini</small></div>
        </div>
        @if(model.metrics.psi!==undefined){<div class="alert-box" [class]="(model.metrics.psi||0)>0.2?'alert-warning':'alert-success'"><i class="fas" [class]="(model.metrics.psi||0)>0.2?'fa-exclamation-triangle':'fa-check-circle'" [style.color]="(model.metrics.psi||0)>0.2?'var(--brand-warning)':'var(--brand-success)'"></i><div><strong>PSI: {{model.metrics.psi}}</strong><br><small>Threshold: 0.2 · {{(model.metrics.psi||0)>0.2?'Drift detected':'Stable'}}</small></div></div>}
      </div>
      <div class="card col-4">
        <h3 style="margin-bottom:16px">Actions</h3>
        @if(model.status==='STAGING'){<button class="btn btn-success" style="width:100%;margin-bottom:8px" (click)="showDeployWizard.set(true)"><i class="fas fa-rocket"></i> Deploy to Production</button>}
        @if(model.status==='PRODUCTION'){<button class="btn btn-danger" style="width:100%;margin-bottom:8px"><i class="fas fa-undo"></i> Rollback</button><button class="btn btn-secondary" style="width:100%;margin-bottom:8px" (click)="tab='challenger'"><i class="fas fa-exchange-alt"></i> A/B Test</button>}
        <button class="btn btn-secondary" style="width:100%;margin-bottom:8px"><i class="fas fa-balance-scale"></i> Fairness Check</button>
        <button class="btn btn-secondary" style="width:100%;margin-bottom:8px"><i class="fas fa-shield-alt"></i> Adversarial Test</button>
        <button class="btn btn-outline" style="width:100%"><i class="fas fa-file-pdf"></i> Export Model Card</button>
        <div style="margin-top:20px"><h4 style="margin-bottom:8px">Tags</h4>@for(t of model.tags;track t){<span class="badge badge-tech" style="margin:4px 4px 0 0">{{t}}</span>}</div>
        @if(model.deployedAt){<div style="margin-top:16px;padding:12px;background:var(--bg-tertiary);border-radius:8px;font-size:.85rem"><i class="fas fa-calendar" style="margin-right:6px"></i>Deployed: {{model.deployedAt}}</div>}
      </div>
    </div>}
    @if(tab==='lineage'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-project-diagram"></i> Model Lineage (MG002)</h3></div>
      <div style="display:flex;align-items:center;gap:16px;padding:20px;overflow-x:auto">
        @for(s of lineageSteps;track s.name;let i=$index){
          <div style="min-width:160px;padding:16px;background:var(--bg-tertiary);border-radius:12px;text-align:center;border:2px solid" [style.border-color]="s.active?'var(--brand-accent)':'var(--border-light)'">
            <i [class]="s.icon" style="font-size:1.5rem;margin-bottom:8px;display:block" [style.color]="s.active?'var(--brand-accent)':'var(--text-tertiary)'"></i>
            <strong style="font-size:.82rem">{{s.name}}</strong><br>
            <small style="color:var(--text-tertiary)">{{s.detail}}</small><br>
            <span style="font-size:.7rem;color:var(--text-tertiary)">{{s.date}}</span>
          </div>
          @if(i<lineageSteps.length-1){<i class="fas fa-arrow-right" style="color:var(--text-tertiary);font-size:1.2rem"></i>}
        }
      </div>
      <h4 style="margin:16px 0 12px">Version History</h4>
      <table class="data-table"><thead><tr><th>Version</th><th>AUC</th><th>Dataset</th><th>Created</th><th>Status</th><th>By</th></tr></thead><tbody>
        @for(v of versionHistory;track v.version){<tr [style.background]="v.version===model.version?'#EFF6FF':'transparent'"><td><strong>{{v.version}}</strong></td><td style="font-weight:700">{{v.auc}}</td><td>{{v.dataset}}</td><td style="font-size:.82rem">{{v.created}}</td><td><span class="badge" [class]="v.status==='PRODUCTION'?'badge-success':v.status==='STAGING'?'badge-info':v.status==='ARCHIVED'?'badge-warning':'badge-info'">{{v.status}}</span></td><td>{{v.by}}</td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='deploy'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-rocket"></i> Deployment Wizard (MG003)</h3></div>
      <div style="display:flex;gap:16px;margin-bottom:24px;padding:16px;background:var(--bg-tertiary);border-radius:12px">
        @for(s of deploySteps;track s.name;let i=$index){<div style="flex:1;text-align:center"><div style="width:36px;height:36px;border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.82rem;color:#fff" [style.background]="i<=deployStep?'var(--brand-accent)':'#CBD5E1'">{{i+1}}</div><strong style="font-size:.78rem">{{s.name}}</strong></div>}
      </div>
      @if(deployStep===0){<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div class="form-group"><label>Target Environment</label><select [(ngModel)]="deployEnv" style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px"><option>Staging</option><option>Production</option><option>Canary (10%)</option></select></div>
        <div class="form-group"><label>Serving Platform</label><select style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px"><option>Seldon Core (gRPC)</option><option>Kubeflow (gRPC)</option><option>SageMaker (REST)</option></select></div>
        <div class="form-group"><label>Replica Count</label><input type="number" value="3" style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px"></div>
        <div class="form-group"><label>Max Latency (ms)</label><input type="number" value="200" style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px"></div>
      </div>}
      @if(deployStep===1){<div><h4 style="margin-bottom:12px">Pre-deploy Checks</h4>@for(c of preDeployChecks;track c.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border-light)"><div><strong>{{c.name}}</strong><br><small style="color:var(--text-tertiary)">{{c.desc}}</small></div><span class="badge" [class]="c.pass?'badge-success':'badge-warning'">{{c.pass?'PASS':'PENDING'}}</span></div>}</div>}
      @if(deployStep===2){<div style="padding:20px;background:var(--bg-tertiary);border-radius:12px"><h4>Approval Required</h4><p style="font-size:.85rem;color:var(--text-secondary)">Model deployment cần phê duyệt từ Risk Manager trước khi apply vào production.</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px"><div><small style="color:var(--text-tertiary)">Reviewer</small><br><strong>Risk Manager Lê</strong></div><div><small style="color:var(--text-tertiary)">Status</small><br><span class="badge badge-warning">Pending Approval</span></div></div></div>}
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">@if(deployStep>0){<button class="btn btn-secondary" (click)="deployStep=deployStep-1">Back</button>}<button class="btn btn-primary" (click)="deployStep=Math.min(deployStep+1,2)"><i class="fas" [class]="deployStep===2?'fa-rocket':'fa-arrow-right'"></i> {{deployStep===2?'Submit for Approval':'Next'}}</button></div>
    </div>}
    @if(tab==='challenger'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-exchange-alt"></i> Champion-Challenger View</h3></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div style="padding:20px;background:#ECFDF5;border:2px solid #059669;border-radius:12px"><h4 style="color:var(--brand-success)"><i class="fas fa-trophy" style="margin-right:6px"></i>Champion</h4><strong style="font-size:1.2rem">XGBoost v3.2.1</strong><br><small style="color:var(--text-tertiary)">Seldon Core · gRPC · Production</small>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;font-size:.85rem"><div><small style="color:var(--text-tertiary)">AUC</small><br><strong>0.952</strong></div><div><small style="color:var(--text-tertiary)">PSI</small><br><strong>0.08</strong></div><div><small style="color:var(--text-tertiary)">Latency</small><br><strong>85ms</strong></div><div><small style="color:var(--text-tertiary)">Traffic</small><br><strong>90%</strong></div></div></div>
        <div style="padding:20px;background:#EFF6FF;border:2px solid #2563EB;border-radius:12px"><h4 style="color:var(--brand-accent)"><i class="fas fa-flask" style="margin-right:6px"></i>Challenger</h4><strong style="font-size:1.2rem">LightGBM v2.1.0</strong><br><small style="color:var(--text-tertiary)">Kubeflow · gRPC · Shadow Mode</small>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;font-size:.85rem"><div><small style="color:var(--text-tertiary)">AUC</small><br><strong>0.948</strong></div><div><small style="color:var(--text-tertiary)">PSI</small><br><strong>0.06</strong></div><div><small style="color:var(--text-tertiary)">Latency</small><br><strong>52ms</strong></div><div><small style="color:var(--text-tertiary)">Traffic</small><br><strong>10%</strong></div></div></div>
      </div>
      <div style="margin-top:16px;display:flex;gap:8px"><button class="btn btn-primary"><i class="fas fa-exchange-alt"></i> Promote Challenger</button><button class="btn btn-secondary"><i class="fas fa-chart-line"></i> Comparison Report</button></div>
    </div>}
    @if(tab==='audit'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-history"></i> Model Audit Trail (MG005)</h3></div>
      @for(a of modelAudit;track a.ts){<div class="timeline-item"><div class="tl-dot" [class]="a.dotClass"><i [class]="a.icon"></i></div><div class="tl-content"><div class="tl-title">{{a.action}}</div><div class="tl-meta">{{a.actor}} · {{a.ts}}</div>@if(a.detail){<div class="tl-detail">{{a.detail}}</div>}</div></div>}
    </div>}

    @if(showDeployWizard()){<div class="modal-overlay" (click)="showDeployWizard.set(false)"><div class="modal-content" style="max-width:500px" (click)="$event.stopPropagation()"><h2>Quick Deploy</h2><p>Confirm deploy {{model.name}} {{model.version}} to production?</p><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn btn-secondary" (click)="showDeployWizard.set(false)">Cancel</button><button class="btn btn-success" (click)="showDeployWizard.set(false)"><i class="fas fa-rocket"></i> Deploy</button></div></div></div>}
  }</div>`, styles: ['']
})
export class ModelDetailComponent implements OnInit {
  model: AIModel | null = null; tab = 'metrics'; deployStep = 0; deployEnv = 'Staging'; showDeployWizard = signal(false);
  Math = Math;
  lineageSteps = [{ name: 'Dataset', detail: 'credit_risk_Q4.csv', date: '15/01/2026', icon: 'fas fa-database', active: false }, { name: 'Feature Eng', detail: '42 features', date: '16/01/2026', icon: 'fas fa-cubes', active: false }, { name: 'Training', detail: 'H2O AutoML 2hr', date: '17/01/2026', icon: 'fas fa-flask', active: false }, { name: 'Validation', detail: 'AUC 0.952', date: '18/01/2026', icon: 'fas fa-check-circle', active: false }, { name: 'Fairness', detail: 'All PASS', date: '19/01/2026', icon: 'fas fa-balance-scale', active: false }, { name: 'Staging', detail: '3 replicas', date: '20/01/2026', icon: 'fas fa-server', active: false }, { name: 'Production', detail: 'Live', date: '25/01/2026', icon: 'fas fa-rocket', active: true }];
  versionHistory = [{ version: 'v3.2.1', auc: 0.952, dataset: 'credit_risk_Q4', created: '25/01/2026', status: 'PRODUCTION', by: 'ds_nguyen' }, { version: 'v3.1.0', auc: 0.945, dataset: 'credit_risk_Q3', created: '15/10/2025', status: 'ARCHIVED', by: 'ds_nguyen' }, { version: 'v3.0.0', auc: 0.938, dataset: 'credit_risk_Q2', created: '01/07/2025', status: 'ARCHIVED', by: 'ds_tran' }, { version: 'v2.5.0', auc: 0.921, dataset: 'credit_risk_Q1', created: '15/04/2025', status: 'ARCHIVED', by: 'ds_tran' }];
  deploySteps = [{ name: 'Configure' }, { name: 'Pre-checks' }, { name: 'Approval' }];
  preDeployChecks = [{ name: 'Unit Tests', desc: 'All model unit tests pass', pass: true }, { name: 'Fairness Check', desc: 'AIF360 fairness metrics within threshold', pass: true }, { name: 'Adversarial Test', desc: 'ART robustness score > 0.85', pass: true }, { name: 'Performance Gate', desc: 'AUC > baseline + 1%', pass: true }, { name: 'Data Drift Check', desc: 'PSI < 0.20', pass: true }];
  modelAudit = [
    { action: 'Deployed to Production', actor: 'ds_nguyen', ts: '25/01/2026 10:00', icon: 'fas fa-rocket', dotClass: 'dot-green', detail: 'Seldon Core, 3 replicas, gRPC:9000' },
    { action: 'Approved by Risk Manager', actor: 'risk_mgr_le', ts: '24/01/2026 16:30', icon: 'fas fa-check', dotClass: 'dot-green', detail: 'All pre-deploy checks passed' },
    { action: 'Fairness audit PASS', actor: 'AIF360 Auto', ts: '23/01/2026 14:00', icon: 'fas fa-balance-scale', dotClass: 'dot-blue', detail: 'DI=0.92, SPD=-0.03, EOD=0.02' },
    { action: 'Staging deployment', actor: 'ds_nguyen', ts: '20/01/2026 09:00', icon: 'fas fa-server', dotClass: 'dot-blue', detail: 'Shadow mode, 10% traffic' },
    { action: 'Model training completed', actor: 'H2O AutoML', ts: '17/01/2026 22:15', icon: 'fas fa-flask', dotClass: 'dot-blue', detail: '24 models evaluated, XGBoost selected' },
    { action: 'Training job created', actor: 'ds_nguyen', ts: '17/01/2026 09:00', icon: 'fas fa-plus', dotClass: 'dot-blue', detail: 'Dataset: credit_risk_Q4, Target: default_flag' }
  ];
  constructor(private route: ActivatedRoute, private m: MockDataService) { } ngOnInit() { const id = this.route.snapshot.paramMap.get('id'); this.model = this.m.getModels().find(m => m.id === id) || null; }
}
