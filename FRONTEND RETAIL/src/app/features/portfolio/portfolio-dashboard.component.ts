import { Component, OnInit, signal } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule } from '@angular/router'; import { MockDataService } from '../../core/services/mock-data.service';
@Component({
  selector: 'app-portfolio-dashboard', standalone: true, imports: [CommonModule, RouterModule],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Credit Portfolio Management</h1><p class="page-subtitle">Module PT001-PT004 · Concentration Analysis · Stress Testing · EWS · Portfolio Optimizer</p></div><button class="btn btn-primary btn-sm"><i class="fas fa-file-export"></i> Export Report</button></div>
    <div class="kpi-grid"><div class="kpi-card kpi-blue"><div class="kpi-icon"><i class="fas fa-chart-pie"></i></div><div class="kpi-label">Tổng dư nợ</div><div class="kpi-value">12.8T</div></div>
      <div class="kpi-card kpi-green"><div class="kpi-icon"><i class="fas fa-percentage"></i></div><div class="kpi-label">NPL Ratio</div><div class="kpi-value">1.8%</div><div class="kpi-trend trend-up"><i class="fas fa-arrow-down"></i> -0.2%</div></div>
      <div class="kpi-card kpi-orange"><div class="kpi-icon"><i class="fas fa-exclamation-triangle"></i></div><div class="kpi-label">EWS Alerts</div><div class="kpi-value">12</div></div>
      <div class="kpi-card kpi-red"><div class="kpi-icon"><i class="fas fa-university"></i></div><div class="kpi-label">CAR</div><div class="kpi-value">12.5%</div><div class="kpi-trend trend-up"><i class="fas fa-check"></i> >8%</div></div></div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="tab==='overview'" (click)="tab='overview'">Overview (PT001)</div>
      <div class="tab-item" [class.active]="tab==='stress'" (click)="tab='stress'">Stress Testing (PT002)</div>
      <div class="tab-item" [class.active]="tab==='ews'" (click)="tab='ews'">EWS Watchlist (PT003)</div>
      <div class="tab-item" [class.active]="tab==='migration'" (click)="tab='migration'">Migration Matrix</div>
      <div class="tab-item" [class.active]="tab==='vintage'" (click)="tab='vintage'">Vintage Analysis</div>
      <div class="tab-item" [class.active]="tab==='optimizer'" (click)="tab='optimizer'">Optimizer (PT004)</div>
    </div>
    @if(tab==='overview'){<div class="row-flex">
      <div class="card col-8">
        <div class="card-header"><h3><i class="fas fa-chart-bar"></i> Rating Distribution</h3></div>
        <div style="display:flex;gap:4px;align-items:flex-end;height:180px;padding:8px">@for(r of ratingDist;track r.rating){<div style="flex:1;text-align:center"><div [style.height.px]="r.pct*1.6" [style.background]="r.color" style="border-radius:4px 4px 0 0;opacity:.8;transition:.3s"></div><small style="font-size:.7rem;font-weight:700">{{r.rating}}</small><br><small style="font-size:.6rem;color:var(--text-tertiary)">{{r.pct}}%</small></div>}</div>
      </div>
      <div class="card col-4">
        <h3 style="margin-bottom:12px"><i class="fas fa-map-marker-alt" style="margin-right:6px"></i>Province Risk (table)</h3>
        @for(p of provinceRisk;track p.province){<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);font-size:.85rem"><span>{{p.province}}</span><div><strong>NPL: {{p.npl}}%</strong> <span class="badge" [class]="p.risk==='Low'?'badge-success':p.risk==='Medium'?'badge-warning':'badge-danger'" style="font-size:.65rem;margin-left:4px">{{p.risk}}</span></div></div>}
      </div>
    </div>}
    @if(tab==='stress'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-tachometer-alt"></i> Stress Test Scenarios (PT002)</h3><span class="badge badge-tech">Monte Carlo</span></div>
      <table class="data-table"><thead><tr><th>Scenario</th><th>GDP Growth</th><th>Interest Rate</th><th>Unemployment</th><th>NPL Rate</th><th>Expected Loss</th><th>CAR</th><th>Status</th></tr></thead><tbody>
        @for(s of stressScenarios;track s.name){<tr [style.background]="s.name==='Extreme'?'#FEF2F2':'transparent'"><td><strong>{{s.name}}</strong></td><td>{{s.gdp}}</td><td>{{s.rate}}</td><td>{{s.unemp}}</td><td style="font-weight:700" [style.color]="s.npl>5?'var(--brand-danger)':'var(--text-primary)'">{{s.npl}}%</td><td style="font-weight:700">{{s.loss}}</td><td style="font-weight:700" [style.color]="s.car<8?'var(--brand-danger)':'var(--brand-success)'">{{s.car}}%</td><td><span class="badge" [class]="s.car>=8?'badge-success':'badge-danger'">{{s.car>=8?'PASS':'FAIL'}}</span></td></tr>}
      </tbody></table>
      <div style="margin-top:16px"><h4>Tornado Sensitivity</h4><div style="display:flex;flex-direction:column;gap:8px;margin-top:12px">@for(t of tornadoData;track t.factor){<div style="display:flex;align-items:center;gap:10px"><span style="width:120px;font-size:.82rem;text-align:right">{{t.factor}}</span><div style="flex:1;display:flex;height:20px"><div [style.width.%]="t.negImpact*3" style="background:#DC2626;border-radius:4px 0 0 4px;display:flex;align-items:center;justify-content:flex-end;padding-right:4px"><small style="color:#fff;font-size:.65rem">-{{t.negImpact}}%</small></div><div [style.width.%]="t.posImpact*3" style="background:#059669;border-radius:0 4px 4px 0;display:flex;align-items:center;padding-left:4px"><small style="color:#fff;font-size:.65rem">+{{t.posImpact}}%</small></div></div></div>}</div>
      </div>
    </div>}
    @if(tab==='ews'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-exclamation-circle"></i> EWS Watchlist (PT003)</h3><span class="badge badge-warning">{{ewsAlerts.length}} alerts</span></div>
      <table class="data-table"><thead><tr><th>Customer</th><th>Loan ID</th><th>Alert Type</th><th>Severity</th><th>Signal</th><th>Score Change</th><th>Action</th></tr></thead><tbody>
        @for(a of ewsAlerts;track a.customer){<tr><td><strong>{{a.customer}}</strong></td><td>{{a.loanId}}</td><td>{{a.type}}</td><td><span class="badge" [class]="a.severity==='HIGH'?'badge-danger':a.severity==='MEDIUM'?'badge-warning':'badge-info'">{{a.severity}}</span></td><td style="font-size:.82rem">{{a.signal}}</td><td style="font-weight:700;color:var(--brand-danger)">{{a.scoreChange}}</td><td><button class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i> Review</button></td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='migration'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-exchange-alt"></i> Rating Migration Matrix</h3><span class="badge badge-tech">Q4/2025 → Q1/2026</span></div>
      <div style="overflow-x:auto"><table class="data-table" style="font-size:.78rem"><thead><tr><th style="position:sticky;left:0;background:var(--bg-primary)">From \\ To</th>@for(r of migrationRatings;track r){<th style="text-align:center">{{r}}</th>}<th>Upgraded</th><th>Downgraded</th></tr></thead><tbody>
        @for(row of migrationMatrix;track row.from;let i=$index){<tr><td style="position:sticky;left:0;background:var(--bg-primary);font-weight:700">{{row.from}}</td>@for(v of row.values;track v;let j=$index){<td style="text-align:center;font-weight:700" [style.background]="i===j?'#EFF6FF':v>0&&i!==j?(j<i?'#ECFDF5':'#FEF2F2'):'transparent'" [style.color]="i===j?'var(--brand-accent)':j<i?'var(--brand-success)':j>i?'var(--brand-danger)':'var(--text-primary)'">{{v}}%</td>}<td style="text-align:center;color:var(--brand-success);font-weight:700">{{row.up}}%</td><td style="text-align:center;color:var(--brand-danger);font-weight:700">{{row.down}}%</td></tr>}
      </tbody></table></div>
    </div>}
    @if(tab==='vintage'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-calendar-alt"></i> Vintage Analysis (Delinquency Curves)</h3></div>
      <table class="data-table"><thead><tr><th>Vintage</th><th>Volume</th><th>Amount</th><th>M3 at 6m</th><th>M3 at 12m</th><th>M3 at 18m</th><th>M3 at 24m</th><th>Trend</th></tr></thead><tbody>
        @for(v of vintageData;track v.vintage){<tr><td><strong>{{v.vintage}}</strong></td><td>{{v.volume}}</td><td>{{v.amount}}</td><td>{{v.m6}}%</td><td>{{v.m12}}%</td><td>{{v.m18}}%</td><td>{{v.m24}}%</td><td><span class="badge" [class]="v.trend==='Improving'?'badge-success':v.trend==='Stable'?'badge-info':'badge-warning'">{{v.trend}}</span></td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='optimizer'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-sliders-h"></i> Portfolio Optimizer (PT004)</h3><span class="badge badge-tech">Efficient Frontier</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
        <div style="padding:20px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px">Current Allocation</h4>@for(a of currentAlloc;track a.segment){<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="width:100px;font-size:.82rem">{{a.segment}}</span><div class="progress-bar" style="flex:1;height:10px"><div class="progress-fill fill-primary" [style.width.%]="a.pct"></div></div><strong style="width:40px;text-align:right;font-size:.82rem">{{a.pct}}%</strong></div>}</div>
        <div style="padding:20px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px">Optimized Allocation</h4>@for(a of optimalAlloc;track a.segment){<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="width:100px;font-size:.82rem">{{a.segment}}</span><div class="progress-bar" style="flex:1;height:10px"><div class="progress-fill" style="background:var(--brand-success)" [style.width.%]="a.pct"></div></div><strong style="width:40px;text-align:right;font-size:.82rem">{{a.pct}}%</strong></div>}</div>
      </div>
      <div style="display:flex;gap:20px;margin-bottom:16px">
        <div style="flex:1;padding:16px;background:#FEF2F2;border-radius:10px;text-align:center"><small>Current Risk-Adjusted Return</small><br><strong style="font-size:1.5rem;color:var(--brand-danger)">8.2%</strong></div>
        <div style="flex:1;padding:16px;background:#ECFDF5;border-radius:10px;text-align:center"><small>Optimized Risk-Adjusted Return</small><br><strong style="font-size:1.5rem;color:var(--brand-success)">9.5%</strong></div>
        <div style="flex:1;padding:16px;background:#EFF6FF;border-radius:10px;text-align:center"><small>Improvement</small><br><strong style="font-size:1.5rem;color:var(--brand-accent)">+1.3%</strong></div>
      </div>
      <button class="btn btn-primary"><i class="fas fa-chart-area"></i> Run Optimization</button>
    </div>}
  </div>`, styles: ['']
})
export class PortfolioDashboardComponent implements OnInit {
  tab = 'overview';
  ratingDist = [{ rating: 'AAA', pct: 8, color: '#047857' }, { rating: 'AA', pct: 15, color: '#059669' }, { rating: 'A', pct: 25, color: '#10B981' }, { rating: 'BBB', pct: 22, color: '#2563EB' }, { rating: 'BB', pct: 15, color: '#F59E0B' }, { rating: 'B', pct: 8, color: '#D97706' }, { rating: 'CCC', pct: 5, color: '#DC2626' }, { rating: 'D', pct: 2, color: '#991B1B' }];
  provinceRisk = [{ province: 'TP. HCM', npl: 1.5, risk: 'Low' }, { province: 'Hà Nội', npl: 1.8, risk: 'Low' }, { province: 'Đà Nẵng', npl: 2.1, risk: 'Medium' }, { province: 'Bình Dương', npl: 1.2, risk: 'Low' }, { province: 'Cần Thơ', npl: 3.5, risk: 'High' }, { province: 'Hải Phòng', npl: 2.8, risk: 'Medium' }];
  stressScenarios = [{ name: 'Baseline', gdp: '+6.5%', rate: '6.0%', unemp: '2.5%', npl: 1.8, loss: '230B', car: 12.5 }, { name: 'Mild', gdp: '+4.0%', rate: '7.5%', unemp: '3.5%', npl: 2.8, loss: '360B', car: 11.2 }, { name: 'Moderate', gdp: '+1.5%', rate: '9.0%', unemp: '5.0%', npl: 4.5, loss: '580B', car: 9.1 }, { name: 'Severe', gdp: '-1.0%', rate: '11.0%', unemp: '7.0%', npl: 7.2, loss: '920B', car: 7.8 }, { name: 'Extreme', gdp: '-3.5%', rate: '13.0%', unemp: '9.5%', npl: 11.5, loss: '1,480B', car: 5.2 }];
  tornadoData = [{ factor: 'GDP Growth', negImpact: 15, posImpact: 5 }, { factor: 'Interest Rate', negImpact: 12, posImpact: 3 }, { factor: 'Unemployment', negImpact: 10, posImpact: 4 }, { factor: 'Property Price', negImpact: 8, posImpact: 6 }, { factor: 'Exchange Rate', negImpact: 5, posImpact: 2 }];
  ewsAlerts = [{ customer: 'Trần Văn B', loanId: 'LV-2450', type: 'Late Payment', severity: 'HIGH', signal: '3 consecutive late payments', scoreChange: '-48' }, { customer: 'Lê Thị C', loanId: 'LV-2380', type: 'Income Drop', severity: 'MEDIUM', signal: 'Salary decreased 30%', scoreChange: '-35' }, { customer: 'Phạm D', loanId: 'LV-2412', type: 'Over-leverage', severity: 'HIGH', signal: 'DTI increased to 55%', scoreChange: '-42' }, { customer: 'Nguyễn E', loanId: 'LV-2395', type: 'Industry Risk', severity: 'MEDIUM', signal: 'Real estate sector downturn', scoreChange: '-20' }, { customer: 'Hoàng F', loanId: 'LV-2466', type: 'Fraud Signal', severity: 'HIGH', signal: 'Unusual transaction pattern', scoreChange: '-55' }];
  migrationRatings = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'D'];
  migrationMatrix = [{ from: 'AAA', values: [92, 6, 1, 1, 0, 0, 0, 0], up: 0, down: 8 }, { from: 'AA', values: [3, 88, 5, 2, 1, 1, 0, 0], up: 3, down: 9 }, { from: 'A', values: [1, 4, 86, 5, 2, 1, 1, 0], up: 5, down: 9 }, { from: 'BBB', values: [0, 1, 5, 84, 6, 2, 1, 1], up: 6, down: 10 }, { from: 'BB', values: [0, 0, 1, 5, 82, 7, 3, 2], up: 6, down: 12 }, { from: 'B', values: [0, 0, 0, 2, 6, 78, 9, 5], up: 8, down: 14 }, { from: 'CCC', values: [0, 0, 0, 0, 2, 8, 72, 18], up: 10, down: 18 }, { from: 'D', values: [0, 0, 0, 0, 0, 2, 8, 90], up: 10, down: 0 }];
  vintageData = [{ vintage: 'Q1/2024', volume: '1,240', amount: '450B', m6: 0.3, m12: 0.8, m18: 1.5, m24: 2.1, trend: 'Stable' }, { vintage: 'Q2/2024', volume: '1,380', amount: '520B', m6: 0.4, m12: 1.0, m18: 1.8, m24: '—', trend: 'Watch' }, { vintage: 'Q3/2024', volume: '1,150', amount: '410B', m6: 0.2, m12: 0.6, m18: '—', m24: '—', trend: 'Improving' }, { vintage: 'Q4/2024', volume: '1,420', amount: '580B', m6: 0.5, m12: 1.2, m18: '—', m24: '—', trend: 'Watch' }, { vintage: 'Q1/2025', volume: '1,350', amount: '500B', m6: 0.3, m12: '—', m18: '—', m24: '—', trend: 'Improving' }];
  currentAlloc = [{ segment: 'Consumer', pct: 35 }, { segment: 'Mortgage', pct: 30 }, { segment: 'Business', pct: 20 }, { segment: 'Credit Card', pct: 10 }, { segment: 'Others', pct: 5 }];
  optimalAlloc = [{ segment: 'Consumer', pct: 30 }, { segment: 'Mortgage', pct: 35 }, { segment: 'Business', pct: 18 }, { segment: 'Credit Card', pct: 12 }, { segment: 'Others', pct: 5 }];
  constructor(private m: MockDataService) { } ngOnInit() { }
}
