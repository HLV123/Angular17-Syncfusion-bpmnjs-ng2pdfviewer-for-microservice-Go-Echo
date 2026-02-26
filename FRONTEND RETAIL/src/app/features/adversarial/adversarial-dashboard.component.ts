import { Component, OnInit } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule } from '@angular/router'; import { MockDataService } from '../../core/services/mock-data.service';
@Component({
  selector: 'app-adversarial-dashboard', standalone: true, imports: [CommonModule, RouterModule],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Adversarial Robustness</h1><p class="page-subtitle">Module AR001-AR004 · ART (Adversarial Robustness Toolbox) · FastAPI REST</p></div><button class="btn btn-primary btn-sm" (click)="tab='hardening'"><i class="fas fa-shield-alt"></i> Model Hardening</button></div>
    <div class="kpi-grid"><div class="kpi-card kpi-blue" style="padding:16px"><div class="kpi-label">Attacks Detected</div><div class="kpi-value" style="font-size:1.6rem">{{attackLogs.length}}</div></div>
      <div class="kpi-card kpi-green" style="padding:16px"><div class="kpi-label">Blocked %</div><div class="kpi-value" style="font-size:1.6rem">96%</div></div>
      <div class="kpi-card kpi-orange" style="padding:16px"><div class="kpi-label">Defense Layers</div><div class="kpi-value" style="font-size:1.6rem">{{defenses.length}}</div></div>
      <div class="kpi-card kpi-red" style="padding:16px"><div class="kpi-label">Avg Robustness</div><div class="kpi-value" style="font-size:1.6rem">0.91</div></div></div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="tab==='attacks'" (click)="tab='attacks'">Attack Detection (AR002)</div>
      <div class="tab-item" [class.active]="tab==='defense'" (click)="tab='defense'">Defense Layers (AR003)</div>
      <div class="tab-item" [class.active]="tab==='robustness'" (click)="tab='robustness'">Robustness Tests (AR001)</div>
      <div class="tab-item" [class.active]="tab==='hardening'" (click)="tab='hardening'">Model Hardening (AR003)</div>
      <div class="tab-item" [class.active]="tab==='patterns'" (click)="tab='patterns'">Pattern Analysis (AR004)</div>
    </div>
    @if(tab==='attacks'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-exclamation-triangle"></i> Attack Detection Log (AR002)</h3><span class="badge badge-tech">Real-time Monitor</span></div>
      <table class="data-table"><thead><tr><th>Time</th><th>Type</th><th>Target</th><th>Severity</th><th>Perturbation</th><th>Status</th><th>Source IP</th></tr></thead><tbody>
        @for(a of attackLogs;track a.ts){<tr><td style="font-family:var(--font-mono);font-size:.78rem">{{a.ts}}</td><td><strong>{{a.type}}</strong></td><td>{{a.target}}</td><td><span class="badge" [class]="a.severity==='HIGH'?'badge-danger':a.severity==='MEDIUM'?'badge-warning':'badge-info'">{{a.severity}}</span></td><td style="font-family:var(--font-mono);font-size:.78rem">ε={{a.epsilon}}</td><td><span class="badge" [class]="a.blocked?'badge-success':'badge-danger'">{{a.blocked?'BLOCKED':'PASSED'}}</span></td><td style="font-family:var(--font-mono);font-size:.78rem">{{a.ip}}</td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='defense'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-shield-alt"></i> Defense Layers (AR003)</h3></div>
      @for(d of defenses;track d.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--border-light)"><div style="flex:1"><strong>{{d.name}}</strong><br><small style="color:var(--text-tertiary)">{{d.desc}}</small></div><div style="text-align:center;min-width:100px"><strong>{{d.effectiveness}}</strong><br><small style="color:var(--text-tertiary)">Effectiveness</small></div><span class="badge" [class]="d.status==='ON'?'badge-success':'badge-warning'" style="min-width:80px;justify-content:center">{{d.status}}</span></div>}
    </div>}
    @if(tab==='robustness'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-vial"></i> Robustness Test Results (AR001)</h3><button class="btn btn-primary btn-sm"><i class="fas fa-play"></i> Run Security Scan</button></div>
      <table class="data-table"><thead><tr><th>Model</th><th>Attack Method</th><th>Epsilon</th><th>Accuracy (Clean)</th><th>Accuracy (Adversarial)</th><th>Robustness</th><th>Status</th></tr></thead><tbody>
        @for(t of robustTests;track t.model+t.attack){<tr><td><strong>{{t.model}}</strong></td><td>{{t.attack}}</td><td style="font-family:var(--font-mono)">{{t.epsilon}}</td><td>{{t.cleanAcc}}</td><td style="font-weight:700" [style.color]="t.advAcc>=0.85?'var(--brand-success)':'var(--brand-warning)'">{{t.advAcc}}</td><td><div class="progress-bar" style="width:80px;height:6px;display:inline-block;vertical-align:middle"><div class="progress-fill" [class]="t.robustness>=0.9?'fill-primary':'fill-warning'" [style.width.%]="t.robustness*100"></div></div> {{(t.robustness*100).toFixed(0)}}%</td><td><span class="badge" [class]="t.robustness>=0.85?'badge-success':'badge-warning'">{{t.robustness>=0.85?'PASS':'WARN'}}</span></td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='hardening'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-hammer"></i> Model Hardening (AR003)</h3><span class="badge badge-tech">ART FastAPI</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
        @for(h of hardeningMethods;track h.name){<div style="padding:16px;background:var(--bg-tertiary);border-radius:12px"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><strong>{{h.name}}</strong><span class="badge" [class]="h.status==='Applied'?'badge-success':h.status==='Available'?'badge-info':'badge-warning'">{{h.status}}</span></div><p style="font-size:.82rem;color:var(--text-secondary);margin-bottom:8px">{{h.desc}}</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.82rem"><div><small style="color:var(--text-tertiary)">Accuracy Impact</small><br><strong [style.color]="h.accImpact<0?'var(--brand-danger)':'var(--brand-success)'">{{h.accImpact>0?'+':''}}{{h.accImpact}}%</strong></div><div><small style="color:var(--text-tertiary)">Robustness Gain</small><br><strong style="color:var(--brand-success)">+{{h.robGain}}%</strong></div></div>@if(h.status==='Available'){<button class="btn btn-sm btn-primary" style="width:100%;margin-top:8px"><i class="fas fa-play"></i> Apply</button>}</div>}
      </div>
    </div>}
    @if(tab==='patterns'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-map-marked-alt"></i> Attack Pattern Analysis (AR004)</h3></div>
      <div class="row-flex">
        <div class="col-6"><h4 style="margin-bottom:12px">By Attack Type</h4>@for(p of attackPatterns;track p.type){<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="width:100px;font-size:.82rem">{{p.type}}</span><div class="progress-bar" style="flex:1;height:10px"><div class="progress-fill" [class]="p.count>10?'fill-warning':'fill-primary'" [style.width.%]="p.pct"></div></div><strong style="width:30px;text-align:right;font-size:.82rem">{{p.count}}</strong></div>}</div>
        <div class="col-6"><h4 style="margin-bottom:12px">Temporal Distribution</h4><div style="display:flex;gap:4px;align-items:flex-end;height:120px;padding:4px">@for(h of hourlyAttacks;track h.hour){<div style="flex:1;text-align:center"><div [style.height.px]="h.count*8" style="background:var(--brand-danger);border-radius:3px 3px 0 0;opacity:.7;min-height:2px"></div><small style="font-size:.55rem;color:var(--text-tertiary)">{{h.hour}}</small></div>}</div>
          <h4 style="margin-top:16px;margin-bottom:12px">Source Geolocation</h4>@for(g of geoSources;track g.country){<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border-light);font-size:.85rem"><span>{{g.country}}</span><strong>{{g.count}} ({{g.pct}}%)</strong></div>}
        </div>
      </div>
    </div>}
  </div>`, styles: ['']
})
export class AdversarialDashboardComponent implements OnInit {
  tab = 'attacks';
  attackLogs = [{ ts: '25/02 09:45', type: 'FGSM', target: 'Credit Risk Model', severity: 'HIGH', epsilon: 0.1, blocked: true, ip: '203.0.113.42' }, { ts: '25/02 08:30', type: 'PGD', target: 'Fraud Detection', severity: 'MEDIUM', epsilon: 0.05, blocked: true, ip: '198.51.100.15' }, { ts: '24/02 22:15', type: 'C&W', target: 'Behavioral Score', severity: 'HIGH', epsilon: 0.03, blocked: true, ip: '192.0.2.88' }, { ts: '24/02 18:00', type: 'DeepFool', target: 'Credit Risk Model', severity: 'LOW', epsilon: 0.15, blocked: true, ip: '10.0.1.99' }, { ts: '24/02 14:30', type: 'FGSM', target: 'Segment Model', severity: 'MEDIUM', epsilon: 0.08, blocked: false, ip: '203.0.113.42' }];
  defenses = [{ name: 'Input Validation & Sanitization', desc: 'Statistical checks on input feature distributions', status: 'ON', effectiveness: '99.2%' }, { name: 'Feature Squeezing', desc: 'Reduce input precision to neutralize small perturbations', status: 'ON', effectiveness: '94.5%' }, { name: 'Adversarial Training', desc: 'Train on adversarial examples for robustness', status: 'ON', effectiveness: '91.3%' }, { name: 'Ensemble Detection', desc: 'Compare predictions across multiple models', status: 'STANDBY', effectiveness: '88.7%' }];
  robustTests = [{ model: 'XGBoost v3.2', attack: 'FGSM', epsilon: 0.1, cleanAcc: 0.95, advAcc: 0.92, robustness: 0.97 }, { model: 'XGBoost v3.2', attack: 'PGD', epsilon: 0.05, cleanAcc: 0.95, advAcc: 0.90, robustness: 0.95 }, { model: 'LightGBM v2.1', attack: 'FGSM', epsilon: 0.1, cleanAcc: 0.94, advAcc: 0.89, robustness: 0.95 }, { model: 'LightGBM v2.1', attack: 'C&W', epsilon: 0.03, cleanAcc: 0.94, advAcc: 0.87, robustness: 0.93 }, { model: 'DeepLearning v0.3', attack: 'FGSM', epsilon: 0.1, cleanAcc: 0.92, advAcc: 0.82, robustness: 0.89 }];
  hardeningMethods = [{ name: 'Adversarial Training (PGD)', desc: 'Augment training data with PGD-generated adversarial examples', status: 'Applied', accImpact: -0.5, robGain: 8 }, { name: 'Certified Defense', desc: 'Provides provable robustness guarantees using randomized smoothing', status: 'Available', accImpact: -1.2, robGain: 12 }, { name: 'Input Gradient Regularization', desc: 'Penalizes large input gradients during training', status: 'Available', accImpact: -0.3, robGain: 5 }, { name: 'Knowledge Distillation', desc: 'Defense through model compression and distillation', status: 'Applied', accImpact: 0.2, robGain: 4 }];
  attackPatterns = [{ type: 'FGSM', count: 15, pct: 40 }, { type: 'PGD', count: 8, pct: 22 }, { type: 'C&W', count: 6, pct: 16 }, { type: 'DeepFool', count: 5, pct: 13 }, { type: 'Others', count: 3, pct: 9 }];
  hourlyAttacks = [{ hour: '00', count: 2 }, { hour: '03', count: 5 }, { hour: '06', count: 1 }, { hour: '09', count: 8 }, { hour: '12', count: 3 }, { hour: '15', count: 4 }, { hour: '18', count: 6 }, { hour: '21', count: 9 }];
  geoSources = [{ country: '🇻🇳 Vietnam (Internal)', count: 12, pct: 32 }, { country: '🇨🇳 China', count: 8, pct: 22 }, { country: '🇷🇺 Russia', count: 6, pct: 16 }, { country: '🇺🇸 United States', count: 5, pct: 14 }, { country: '🌍 Others', count: 6, pct: 16 }];
  constructor(private m: MockDataService) { } ngOnInit() { }
}
