import { Component, OnInit, signal } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule } from '@angular/router'; import { MockDataService } from '../../core/services/mock-data.service';
@Component({
  selector: 'app-compliance-dashboard', standalone: true, imports: [CommonModule, RouterModule],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Báo Cáo & Tuân Thủ</h1><p class="page-subtitle">Module BC001-BC005 · Basel III · Circular 02 · IFRS 9 · GDPR · Audit Trail</p></div><button class="btn btn-primary btn-sm" (click)="showGenReport.set(true)"><i class="fas fa-file-export"></i> Generate Report</button></div>
    <div class="kpi-grid"><div class="kpi-card kpi-blue"><div class="kpi-icon"><i class="fas fa-shield-alt"></i></div><div class="kpi-label">Overall Compliance</div><div class="kpi-value">94%</div><div class="kpi-trend trend-up"><i class="fas fa-arrow-up"></i> +2% vs Q3</div></div>
      <div class="kpi-card kpi-green"><div class="kpi-icon"><i class="fas fa-balance-scale"></i></div><div class="kpi-label">Regulations Met</div><div class="kpi-value">5/6</div></div>
      <div class="kpi-card kpi-orange"><div class="kpi-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="kpi-label">Open Issues</div><div class="kpi-value">3</div></div>
      <div class="kpi-card kpi-red"><div class="kpi-icon"><i class="fas fa-clock"></i></div><div class="kpi-label">SLA Breaches</div><div class="kpi-value">1</div></div></div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="tab==='regs'" (click)="tab='regs'">Regulatory Checklist</div>
      <div class="tab-item" [class.active]="tab==='reports'" (click)="tab='reports'">Reports (BC001-BC003)</div>
      <div class="tab-item" [class.active]="tab==='modelcard'" (click)="tab='modelcard'">Model Card (BC002)</div>
      <div class="tab-item" [class.active]="tab==='ifrs9'" (click)="tab='ifrs9'">IFRS 9 / ECL (BC003)</div>
      <div class="tab-item" [class.active]="tab==='audit'" (click)="tab='audit'">Audit Events (BC005)</div>
    </div>
    @if(tab==='regs'){<div class="row-flex"><div class="card col-8">
      <div class="card-header"><h3><i class="fas fa-gavel"></i> Regulatory Compliance</h3></div>
      @for(r of regulations;track r.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--border-light)"><div><strong style="font-size:1rem">{{r.name}}</strong><br><small style="color:var(--text-tertiary)">{{r.desc}}</small></div><div style="display:flex;align-items:center;gap:12px"><div style="width:120px"><div class="progress-bar" style="height:8px"><div class="progress-fill" [class]="r.score>=90?'fill-primary':'fill-warning'" [style.width.%]="r.score"></div></div></div><strong style="width:40px;text-align:right" [style.color]="r.score>=90?'var(--brand-success)':'var(--brand-warning)'">{{r.score}}%</strong><span class="badge" [class]="r.status==='COMPLIANT'?'badge-success':'badge-warning'">{{r.status}}</span></div></div>}
    </div>
    <div class="card col-4">
      <div class="card-header"><h3><i class="fas fa-bug"></i> Open Issues</h3></div>
      @for(i of issues;track i.title){<div style="padding:12px;border-bottom:1px solid var(--border-light)"><div style="display:flex;justify-content:space-between"><strong style="font-size:.85rem">{{i.title}}</strong><span class="badge" [class]="i.severity==='HIGH'?'badge-danger':i.severity==='MEDIUM'?'badge-warning':'badge-info'" style="font-size:.65rem">{{i.severity}}</span></div><small style="color:var(--text-tertiary)">Due: {{i.deadline}}</small></div>}
    </div></div>}
    @if(tab==='reports'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-file-alt"></i> Credit Reports (BC001)</h3></div>
      <table class="data-table"><thead><tr><th>Report</th><th>Period</th><th>Type</th><th>Generated</th><th>Status</th><th>Size</th><th></th></tr></thead><tbody>
        @for(r of creditReports;track r.name){<tr><td><strong>{{r.name}}</strong></td><td>{{r.period}}</td><td><span class="badge badge-info">{{r.type}}</span></td><td style="font-size:.82rem">{{r.generated}}</td><td><span class="badge" [class]="r.status==='Ready'?'badge-success':'badge-warning'">{{r.status}}</span></td><td>{{r.size}}</td><td><div style="display:flex;gap:4px"><button class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i></button><button class="btn btn-sm btn-secondary"><i class="fas fa-file-pdf"></i></button><button class="btn btn-sm btn-secondary"><i class="fas fa-file-excel"></i></button></div></td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='modelcard'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-id-card"></i> AI Model Cards (BC002)</h3></div>
      @for(mc of modelCards;track mc.model){<div style="padding:20px;background:var(--bg-tertiary);border-radius:12px;margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h4>{{mc.model}} {{mc.version}}</h4><button class="btn btn-sm btn-secondary"><i class="fas fa-file-pdf"></i> Export PDF</button></div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;font-size:.85rem">
          <div><small style="color:var(--text-tertiary)">Purpose</small><br><strong>{{mc.purpose}}</strong></div>
          <div><small style="color:var(--text-tertiary)">Training Data</small><br><strong>{{mc.trainingData}}</strong></div>
          <div><small style="color:var(--text-tertiary)">Performance</small><br><strong>AUC: {{mc.auc}}</strong></div>
          <div><small style="color:var(--text-tertiary)">Fairness</small><br><span class="badge" [class]="mc.fairness==='PASS'?'badge-success':'badge-warning'">{{mc.fairness}}</span></div>
          <div><small style="color:var(--text-tertiary)">Limitations</small><br><strong>{{mc.limitations}}</strong></div>
          <div><small style="color:var(--text-tertiary)">Ethical Review</small><br><span class="badge badge-success">Approved</span></div>
          <div><small style="color:var(--text-tertiary)">Last Updated</small><br><strong>{{mc.updated}}</strong></div>
          <div><small style="color:var(--text-tertiary)">Owner</small><br><strong>{{mc.owner}}</strong></div>
        </div>
      </div>}
    </div>}
    @if(tab==='ifrs9'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-calculator"></i> IFRS 9 / ECL Report (BC003)</h3><span class="badge badge-tech">Expected Credit Loss</span></div>
      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px">
        <div class="kpi-card kpi-blue" style="padding:14px"><div class="kpi-label">Total ECL</div><div class="kpi-value" style="font-size:1.3rem">45.2B</div></div>
        <div class="kpi-card kpi-green" style="padding:14px"><div class="kpi-label">Stage 1 (12m)</div><div class="kpi-value" style="font-size:1.3rem">32.1B</div></div>
        <div class="kpi-card kpi-orange" style="padding:14px"><div class="kpi-label">Stage 2 (Lifetime)</div><div class="kpi-value" style="font-size:1.3rem">9.8B</div></div>
        <div class="kpi-card kpi-red" style="padding:14px"><div class="kpi-label">Stage 3 (Impaired)</div><div class="kpi-value" style="font-size:1.3rem">3.3B</div></div>
      </div>
      <table class="data-table"><thead><tr><th>Segment</th><th>Exposure</th><th>PD</th><th>LGD</th><th>EAD</th><th>ECL</th><th>Coverage</th><th>Stage</th></tr></thead><tbody>
        @for(e of eclData;track e.segment){<tr><td><strong>{{e.segment}}</strong></td><td>{{e.exposure}}</td><td>{{e.pd}}%</td><td>{{e.lgd}}%</td><td>{{e.ead}}</td><td style="font-weight:700">{{e.ecl}}</td><td>{{e.coverage}}%</td><td><span class="badge" [class]="e.stage===1?'badge-success':e.stage===2?'badge-warning':'badge-danger'">Stage {{e.stage}}</span></td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='audit'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-history"></i> Audit Events (BC005)</h3></div>
      <table class="data-table"><thead><tr><th>Thời gian</th><th>Loại</th><th>Chi tiết</th><th>User</th><th>Entity</th></tr></thead><tbody>
        @for(a of auditEvents;track a.ts){<tr><td style="font-family:var(--font-mono);font-size:.78rem">{{a.ts}}</td><td><span class="badge" [class]="a.type==='CONFIG_CHANGE'?'badge-warning':a.type==='MODEL_DEPLOY'?'badge-info':a.type==='ACCESS'?'badge-tech':a.type==='APPROVAL'?'badge-success':'badge-danger'">{{a.type}}</span></td><td>{{a.detail}}</td><td><strong>{{a.user}}</strong></td><td>{{a.entity}}</td></tr>}
      </tbody></table>
    </div>}

    @if(showGenReport()){<div class="modal-overlay" (click)="showGenReport.set(false)"><div class="modal-content" style="max-width:500px" (click)="$event.stopPropagation()">
      <h2><i class="fas fa-file-export" style="margin-right:8px"></i>Generate Report</h2>
      <div class="form-group"><label>Report Type</label><select style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px"><option>Hoạt động tín dụng (BC001)</option><option>Model Card (BC002)</option><option>IFRS 9 / ECL (BC003)</option><option>AI Compliance (BC004)</option><option>Audit Trail (BC005)</option></select></div>
      <div class="form-group"><label>Period</label><div style="display:flex;gap:8px"><select style="flex:1;padding:10px;border:1px solid var(--border-light);border-radius:8px"><option>Q4/2025</option><option>Q1/2026</option><option>02/2026</option></select><select style="width:120px;padding:10px;border:1px solid var(--border-light);border-radius:8px"><option>PDF</option><option>Excel</option><option>Both</option></select></div></div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn btn-secondary" (click)="showGenReport.set(false)">Hủy</button><button class="btn btn-primary" (click)="showGenReport.set(false)"><i class="fas fa-cog"></i> Generate</button></div>
    </div></div>}
  </div>`, styles: ['']
})
export class ComplianceDashboardComponent implements OnInit {
  tab = 'regs'; showGenReport = signal(false);
  regulations = [{ name: 'Basel III / SBV', desc: 'Capital adequacy, risk-weighted assets', score: 95, status: 'COMPLIANT' }, { name: 'Circular 02/2023/TT-NHNN', desc: 'Asset classification & provisioning', score: 92, status: 'COMPLIANT' }, { name: 'GDPR / PDPA', desc: 'Data privacy & protection', score: 88, status: 'PARTIAL' }, { name: 'AI Ethics Guidelines', desc: 'Transparency, fairness, accountability', score: 96, status: 'COMPLIANT' }, { name: 'IFRS 9', desc: 'Financial instruments & ECL', score: 90, status: 'COMPLIANT' }, { name: 'Internal Risk Policy', desc: 'Bank risk appetite framework', score: 98, status: 'COMPLIANT' }];
  issues = [{ title: 'GDPR: consent form update needed', severity: 'HIGH', deadline: '01/03/2026' }, { title: 'AI model card v3 update pending', severity: 'MEDIUM', deadline: '15/03/2026' }, { title: 'Monthly ECL report delayed', severity: 'LOW', deadline: '28/02/2026' }];
  creditReports = [{ name: 'Báo cáo hoạt động tín dụng tháng 02/2026', period: '02/2026', type: 'Monthly', generated: '25/02/2026', status: 'Ready', size: '2.4MB' }, { name: 'Báo cáo rủi ro danh mục Q4/2025', period: 'Q4/2025', type: 'Quarterly', generated: '15/01/2026', status: 'Ready', size: '8.1MB' }, { name: 'Báo cáo tuân thủ AI 2025', period: '2025', type: 'Annual', generated: '31/01/2026', status: 'Ready', size: '12.3MB' }, { name: 'SBV Report - Circular 02', period: '02/2026', type: 'Regulatory', generated: '25/02/2026', status: 'Draft', size: '—' }];
  modelCards = [{ model: 'XGBoost Credit Risk', version: 'v3.2.1', purpose: 'PD estimation for retail loans', trainingData: '125K samples, 42 features', auc: 0.952, fairness: 'PASS', limitations: 'Not validated for SME >5B', updated: '25/01/2026', owner: 'ds_nguyen' }, { model: 'LightGBM Fraud', version: 'v2.1.0', purpose: 'Real-time fraud detection', trainingData: '89K samples, 35 features', auc: 0.948, fairness: 'PASS', limitations: 'Limited to online transactions', updated: '01/02/2026', owner: 'ds_tran' }];
  eclData = [{ segment: 'Consumer Loans', exposure: '2,500B', pd: 1.8, lgd: 45, ead: '2,480B', ecl: '20.1B', coverage: 0.81, stage: 1 }, { segment: 'Mortgage', exposure: '4,200B', pd: 0.5, lgd: 25, ead: '4,180B', ecl: '5.2B', coverage: 0.12, stage: 1 }, { segment: 'Credit Cards', exposure: '800B', pd: 3.2, lgd: 70, ead: '760B', ecl: '17.1B', coverage: 2.14, stage: 2 }, { segment: 'Business Loans', exposure: '600B', pd: 5.5, lgd: 55, ead: '590B', ecl: '2.8B', coverage: 0.47, stage: 3 }];
  auditEvents = [{ ts: '25/02 09:45', type: 'APPROVAL', detail: 'Approved loan LV-2435', user: 'officer_le', entity: 'LoanApplication' }, { ts: '25/02 09:30', type: 'CONFIG_CHANGE', detail: 'Scoring threshold: 750→730', user: 'admin', entity: 'SystemConfig' }, { ts: '25/02 08:00', type: 'MODEL_DEPLOY', detail: 'XGBoost v3.2.1 deployed', user: 'ds_nguyen', entity: 'AIModel' }, { ts: '24/02 16:30', type: 'ACCESS', detail: 'Exported 150 records', user: 'analyst_tran', entity: 'Customer' }, { ts: '24/02 14:00', type: 'APPROVAL', detail: 'Auto fairness audit Q4', user: 'system', entity: 'FairnessReport' }, { ts: '23/02 22:00', type: 'ALERT', detail: 'EWS: 4 new alerts generated', user: 'system', entity: 'EWSAlert' }];
  constructor(private m: MockDataService) { } ngOnInit() { }
}
