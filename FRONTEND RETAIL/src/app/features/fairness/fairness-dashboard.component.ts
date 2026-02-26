import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule } from '@angular/router'; import { MockDataService } from '../../core/services/mock-data.service';
import * as d3 from 'd3';
@Component({
  selector: 'app-fairness-dashboard', standalone: true, imports: [CommonModule, RouterModule],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Fairness & Bias Detection</h1><p class="page-subtitle">Module FB001-FB004 · AIF360 REST API · Pareto Chart · Protected Groups</p></div><button class="btn btn-primary btn-sm"><i class="fas fa-file-pdf"></i> Export Fairness Report</button></div>
    <div class="kpi-grid"><div class="kpi-card" style="padding:20px;text-align:center" [style.border-top]="overallPass?'4px solid var(--brand-success)':'4px solid var(--brand-danger)'"><div style="font-size:2rem;font-weight:800" [style.color]="overallPass?'var(--brand-success)':'var(--brand-danger)'">{{overallPass?'PASS':'FAIL'}}</div><small style="color:var(--text-tertiary)">Overall Fairness</small></div>
      <div class="kpi-card kpi-blue" style="padding:16px"><div class="kpi-label">Metrics Passed</div><div class="kpi-value" style="font-size:1.6rem">{{passCount}}/{{metrics.length}}</div></div>
      <div class="kpi-card kpi-green" style="padding:16px"><div class="kpi-label">Disparate Impact</div><div class="kpi-value" style="font-size:1.4rem">0.92</div><div class="kpi-trend trend-up"><i class="fas fa-check"></i> ≥0.80</div></div>
      <div class="kpi-card kpi-orange" style="padding:16px"><div class="kpi-label">Protected Groups</div><div class="kpi-value" style="font-size:1.6rem">4</div></div></div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="tab==='metrics'" (click)="tab='metrics'">Fairness Metrics (FB001)</div>
      <div class="tab-item" [class.active]="tab==='groups'" (click)="tab='groups'">Group Rates (FB001)</div>
      <div class="tab-item" [class.active]="tab==='mitigation'" (click)="tab='mitigation'">Bias Mitigation (FB002)</div>
      <div class="tab-item" [class.active]="tab==='pareto'" (click)="tab='pareto';drawPareto()">Trade-off (Pareto)</div>
      <div class="tab-item" [class.active]="tab==='cicd'" (click)="tab='cicd'">CI/CD Pipeline (FB004)</div>
    </div>
    @if(tab==='metrics'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-balance-scale"></i> Fairness Metrics</h3><span class="badge badge-tech">AIF360 REST</span></div>
      <table class="data-table"><thead><tr><th>Metric</th><th>Protected Group</th><th>Value</th><th>Threshold</th><th>Status</th></tr></thead><tbody>
        @for(m of metrics;track m.name){<tr><td><strong>{{m.name}}</strong><br><small style="color:var(--text-tertiary)">{{m.desc}}</small></td><td>{{m.group}}</td><td style="font-weight:700">{{m.value}}</td><td style="font-family:var(--font-mono);font-size:.82rem">{{m.threshold}}</td><td><span class="badge" [class]="m.pass?'badge-success':'badge-danger'">{{m.pass?'PASS':'FAIL'}}</span></td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='groups'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-users"></i> Approval Rates by Group</h3></div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px">@for(g of groupRates;track g.name){<div style="padding:16px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px">{{g.name}}</h4>@for(s of g.segments;track s.label){<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="width:80px;font-size:.82rem">{{s.label}}</span><div class="progress-bar" style="flex:1;height:10px"><div class="progress-fill fill-primary" [style.width.%]="s.rate"></div></div><strong style="width:40px;text-align:right;font-size:.82rem">{{s.rate}}%</strong></div>}</div>}</div>
    </div>}
    @if(tab==='mitigation'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-wrench"></i> Bias Mitigation (FB002)</h3></div>
      @for(m of mitigations;track m.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:16px;border-bottom:1px solid var(--border-light)"><div style="flex:1"><strong>{{m.name}}</strong><br><small style="color:var(--text-tertiary)">{{m.desc}}</small></div><span class="badge badge-tech" style="margin-right:12px">{{m.phase}}</span><span class="badge" [class]="m.status==='Applied'?'badge-success':m.status==='Standby'?'badge-warning':'badge-info'">{{m.status}}</span></div>}
    </div>}
    @if(tab==='pareto'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-chart-area"></i> Accuracy vs Fairness Trade-off</h3><span class="badge badge-tech">D3.js Pareto</span></div>
      <div #paretoChart style="height:350px;overflow:hidden"></div>
      <div style="margin-top:12px;font-size:.82rem;color:var(--text-tertiary);text-align:center">X: Disparate Impact (higher = fairer) · Y: AUC-ROC (higher = more accurate) · Size: Model complexity</div>
    </div>}
    @if(tab==='cicd'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-code-branch"></i> Fairness CI/CD Pipeline (FB004)</h3></div>
      <div style="display:flex;align-items:center;gap:16px;padding:20px;overflow-x:auto;margin-bottom:20px">
        @for(s of cicdSteps;track s.name;let i=$index){<div style="min-width:140px;padding:16px;background:var(--bg-tertiary);border-radius:12px;text-align:center;border:2px solid" [style.border-color]="s.pass?'var(--brand-success)':'var(--border-light)'"><i [class]="s.icon" style="font-size:1.3rem;margin-bottom:6px;display:block" [style.color]="s.pass?'var(--brand-success)':'var(--text-tertiary)'"></i><strong style="font-size:.78rem">{{s.name}}</strong><br><span class="badge" [class]="s.pass?'badge-success':'badge-info'" style="font-size:.6rem;margin-top:4px">{{s.pass?'PASS':'PENDING'}}</span></div>@if(i<cicdSteps.length-1){<i class="fas fa-arrow-right" style="color:var(--text-tertiary)"></i>}}
      </div>
      <div style="padding:14px;background:#ECFDF5;border-radius:10px"><i class="fas fa-check-circle" style="color:var(--brand-success);margin-right:6px"></i><strong>Last pipeline run:</strong> 25/02/2026 08:00 — All fairness gates PASSED</div>
    </div>}
  </div>`, styles: ['']
})
export class FairnessDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('paretoChart') paretoChart!: ElementRef; tab = 'metrics'; overallPass = true; passCount = 0;
  metrics: any[] = [];
  groupRates = [{ name: 'Giới tính', segments: [{ label: 'Nam', rate: 68 }, { label: 'Nữ', rate: 65 }] }, { name: 'Độ tuổi', segments: [{ label: '22-30', rate: 62 }, { label: '31-45', rate: 72 }, { label: '46-60', rate: 58 }] }, { name: 'Khu vực', segments: [{ label: 'TP.HCM', rate: 71 }, { label: 'Hà Nội', rate: 69 }, { label: 'Khác', rate: 64 }] }, { name: 'Thu nhập', segments: [{ label: '<10M', rate: 45 }, { label: '10-20M', rate: 68 }, { label: '>20M', rate: 82 }] }];
  mitigations = [{ name: 'Reweighing', desc: 'Pre-processing: reweight training samples', phase: 'Pre-processing', status: 'Applied' }, { name: 'Adversarial Debiasing', desc: 'In-processing: adversarial learning to remove bias', phase: 'In-processing', status: 'Applied' }, { name: 'Calibrated Equalized Odds', desc: 'Post-processing: adjust predictions', phase: 'Post-processing', status: 'Standby' }, { name: 'Reject Option Classification', desc: 'Post-processing: flip borderline predictions', phase: 'Post-processing', status: 'Standby' }];
  cicdSteps = [{ name: 'Data Bias Check', icon: 'fas fa-database', pass: true }, { name: 'Training Fairness', icon: 'fas fa-flask', pass: true }, { name: 'AIF360 Metrics', icon: 'fas fa-balance-scale', pass: true }, { name: 'Threshold Gate', icon: 'fas fa-door-open', pass: true }, { name: 'Deploy Approval', icon: 'fas fa-user-check', pass: true }];
  paretoData = [{ name: 'XGBoost v3.2', auc: 0.952, di: 0.92, size: 30 }, { name: 'LightGBM v2.1', auc: 0.948, di: 0.95, size: 25 }, { name: 'RF v1.5', auc: 0.935, di: 0.88, size: 35 }, { name: 'DeepLearn v0.3', auc: 0.921, di: 0.85, size: 45 }, { name: 'Logistic Reg', auc: 0.890, di: 0.97, size: 15 }, { name: 'GBM v1.1', auc: 0.918, di: 0.90, size: 28 }, { name: 'XGB+Debiased', auc: 0.940, di: 0.96, size: 32 }];
  constructor(private m: MockDataService) { }
  ngOnInit() { const raw = this.m.getFairnessMetrics(); this.metrics = [{ name: 'Disparate Impact', desc: 'Ratio of positive rates', group: 'Gender', value: 0.92, threshold: '≥0.80', pass: true }, { name: 'Statistical Parity Diff', desc: 'Difference in positive rates', group: 'Gender', value: -0.03, threshold: '|x|≤0.10', pass: true }, { name: 'Equal Opportunity Diff', desc: 'Difference in TPR', group: 'Age', value: 0.05, threshold: '|x|≤0.10', pass: true }, { name: 'Equalized Odds Diff', desc: 'Max diff in TPR & FPR', group: 'Age', value: 0.08, threshold: '|x|≤0.10', pass: true }, { name: 'Theil Index', desc: 'Generalized entropy', group: 'Region', value: 0.12, threshold: '≤0.15', pass: true }, { name: 'Statistical Parity', desc: 'Across income groups', group: 'Income', value: -0.15, threshold: '|x|≤0.10', pass: false }, { name: 'Calibration by Group', desc: 'Predicted prob = actual rate', group: 'All', value: 'OK', threshold: '±5%', pass: true }, { name: 'Counterfactual Fairness', desc: 'Same outcome on flip', group: 'Gender', value: 0.94, threshold: '≥0.90', pass: true }]; this.passCount = this.metrics.filter(m => m.pass).length; this.overallPass = this.passCount >= this.metrics.length - 1; }
  ngAfterViewInit() { }
  drawPareto() { setTimeout(() => { if (!this.paretoChart) return; const el = this.paretoChart.nativeElement; el.innerHTML = ''; const w = el.clientWidth, h = 320, margin = { top: 20, right: 30, bottom: 40, left: 50 }; const svg = d3.select(el).append('svg').attr('width', w).attr('height', h); const x = d3.scaleLinear().domain([0.82, 1]).range([margin.left, w - margin.right]); const y = d3.scaleLinear().domain([0.88, 0.96]).range([h - margin.bottom, margin.top]); svg.append('g').attr('transform', `translate(0,${h - margin.bottom})`).call(d3.axisBottom(x).ticks(6)); svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(5)); this.paretoData.forEach(d => { svg.append('circle').attr('cx', x(d.di)).attr('cy', y(d.auc)).attr('r', d.size / 3).attr('fill', d.name.includes('Debiased') ? '#059669' : d.auc >= 0.94 ? '#2563EB' : '#F59E0B').attr('opacity', 0.7).attr('stroke', '#fff').attr('stroke-width', 1); svg.append('text').attr('x', x(d.di) + d.size / 3 + 4).attr('y', y(d.auc) + 3).text(d.name).style('font-size', '10px').style('fill', 'var(--text-secondary)'); }); }, 200); }
}
