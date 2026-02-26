import { Component, OnInit, OnDestroy } from '@angular/core'; import { CommonModule } from '@angular/common';
import { MockSocketService } from '../../core/services/mock-socket.service';
import { StompService } from '../../core/services/stomp.service';
import { Subscription } from 'rxjs';
import { NgxEchartsDirective } from 'ngx-echarts';
@Component({
  selector: 'app-monitoring-dashboard', standalone: true, imports: [CommonModule, NgxEchartsDirective],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Model Monitoring & EWS</h1><p class="page-subtitle">Module MON001-MON005 · Drift Detection · EWS · Prometheus/Grafana · STOMP WebSocket</p></div><div style="display:flex;gap:8px"><span class="badge badge-tech" style="padding:8px 14px"><i class="fas fa-satellite-dish" style="margin-right:4px"></i>STOMP Connected</span><button class="btn btn-primary btn-sm"><i class="fas fa-sync"></i> Refresh</button></div></div>
    <div class="kpi-grid">
      <div class="kpi-card kpi-green" style="padding:16px"><div class="kpi-label">System Health</div><div class="kpi-value" style="font-size:1.3rem">HEALTHY</div><div class="kpi-trend trend-up"><i class="fas fa-heartbeat"></i> 99.8% uptime</div></div>
      <div class="kpi-card kpi-blue" style="padding:16px"><div class="kpi-label">Models Monitored</div><div class="kpi-value" style="font-size:1.6rem">7</div><div class="kpi-trend">Real-time via WS</div></div>
      <div class="kpi-card kpi-orange" style="padding:16px"><div class="kpi-label">Drift Alerts</div><div class="kpi-value" style="font-size:1.6rem">2</div><div class="kpi-trend"><i class="fas fa-exclamation-triangle"></i> 1 critical</div></div>
      <div class="kpi-card kpi-red" style="padding:16px"><div class="kpi-label">EWS Alerts</div><div class="kpi-value" style="font-size:1.6rem">{{ewsAlerts.length}}</div><div class="kpi-trend">Active warnings</div></div>
    </div>
    <div class="row-flex">
      <div class="card col-8">
        <div class="card-header"><h3><i class="fas fa-chart-line"></i> Model Performance Tracking</h3><span class="badge badge-tech">STOMP Real-time</span></div>
        @for(m of modelHealth;track m.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border-bottom:1px solid var(--border-light)">
          <div style="min-width:180px"><strong>{{m.name}}</strong><br><small style="color:var(--text-tertiary)">{{m.version}}</small></div>
          <div style="display:flex;gap:20px;align-items:center">
            <div style="text-align:center"><small style="color:var(--text-tertiary)">AUC</small><br><strong [style.color]="m.auc>=0.9?'var(--brand-success)':'var(--brand-warning)'">{{m.auc}}</strong></div>
            <div style="text-align:center"><small style="color:var(--text-tertiary)">PSI</small><br><strong [style.color]="m.psi>0.2?'var(--brand-danger)':'var(--brand-success)'">{{m.psi}}</strong></div>
            <div style="text-align:center"><small style="color:var(--text-tertiary)">Latency</small><br><strong>{{m.latency}}ms</strong></div>
            <div style="text-align:center"><small style="color:var(--text-tertiary)">Req/min</small><br><strong>{{m.rpm}}</strong></div>
          </div>
          <span class="badge" [class]="m.status==='OK'?'badge-success':m.status==='WARNING'?'badge-warning':'badge-danger'">{{m.status}}</span>
        </div>}
      </div>
      <div class="card col-4">
        <div class="card-header"><h3><i class="fas fa-bell" style="color:var(--brand-danger)"></i> EWS Alerts (MON004)</h3></div>
        @for(a of ewsAlerts;track a.customer){<div class="alert-box" [class]="a.severity==='HIGH'?'alert-danger':'alert-warning'" style="margin-bottom:8px">
          <i class="fas fa-exclamation-triangle" [style.color]="a.severity==='HIGH'?'var(--brand-danger)':'var(--brand-warning)'"></i>
          <div><strong>{{a.customer}}</strong><br><small>{{a.type}} · PD: {{a.pd}}% · Trigger: {{a.trigger}}</small></div>
        </div>}
        <button class="btn btn-secondary" style="width:100%;margin-top:12px"><i class="fas fa-list"></i> View All EWS</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-wave-square"></i> Data Drift Detection (MON002)</h3></div>
      <table class="data-table"><thead><tr><th>Feature</th><th>PSI</th><th>KL Divergence</th><th>JS Distance</th><th>Status</th><th>Action</th></tr></thead><tbody>
        @for(d of driftFeatures;track d.name){<tr><td><strong>{{d.name}}</strong></td><td style="font-weight:700" [style.color]="d.psi>0.2?'var(--brand-danger)':d.psi>0.1?'var(--brand-warning)':'var(--brand-success)'">{{d.psi}}</td><td>{{d.kl}}</td><td>{{d.js}}</td><td><span class="badge" [class]="d.psi>0.2?'badge-danger':d.psi>0.1?'badge-warning':'badge-success'">{{d.psi>0.2?'DRIFT':d.psi>0.1?'WATCH':'STABLE'}}</span></td><td>@if(d.psi>0.2){<button class="btn btn-sm btn-danger"><i class="fas fa-redo"></i> Retrain</button>}</td></tr>}
      </tbody></table>
    </div>
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-chart-line"></i> Real-time Latency (ECharts)</h3><span class="badge badge-tech">ngx-echarts · STOMP WebSocket</span></div>
      <div echarts [options]="latencyChartOption" style="height:250px"></div>
    </div>
  </div>`, styles: ['']
})
export class MonitoringDashboardComponent implements OnInit, OnDestroy {
  sub!: Subscription;
  latencySeries: number[] = [];
  latencyLabels: string[] = [];
  latencyChartOption: any = {};
  constructor(private mockSocket: MockSocketService, private stompService: StompService) { }

  ngOnInit() {
    this.sub = this.stompService.getModelMetrics().subscribe(metrics => {
      this.modelHealth = this.modelHealth.map(m => {
        const dLatency = Math.floor((Math.random() - 0.5) * 15);
        const dRpm = Math.floor((Math.random() - 0.5) * 8);
        return {
          ...m,
          latency: Math.max(10, m.latency + dLatency),
          rpm: Math.max(0, m.rpm + dRpm)
        };
      });
      // Update ECharts latency timeseries
      const now = new Date().toLocaleTimeString();
      this.latencySeries.push(this.modelHealth[0].latency);
      this.latencyLabels.push(now);
      if (this.latencySeries.length > 20) { this.latencySeries.shift(); this.latencyLabels.shift(); }
      this.latencyChartOption = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: this.latencyLabels, axisLabel: { fontSize: 10 } },
        yAxis: { type: 'value', name: 'ms', min: 0 },
        series: [{ name: 'XGBoost Latency', type: 'line', data: this.latencySeries, smooth: true, areaStyle: { opacity: 0.15 }, lineStyle: { width: 2, color: '#2563EB' }, itemStyle: { color: '#2563EB' } }],
        grid: { left: 50, right: 20, top: 30, bottom: 30 }
      };
    });
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
  modelHealth = [
    { name: 'XGBoost Credit Risk', version: 'v3.2.1', auc: 0.952, psi: 0.08, latency: 85, rpm: 42, status: 'OK' },
    { name: 'LightGBM Fraud', version: 'v2.1.0', auc: 0.948, psi: 0.22, latency: 120, rpm: 38, status: 'WARNING' },
    { name: 'DeepLearning Behavioral', version: 'v1.5.3', auc: 0.921, psi: 0.05, latency: 350, rpm: 25, status: 'OK' },
    { name: 'Segmentation Model', version: 'v1.0.2', auc: 0.890, psi: 0.12, latency: 200, rpm: 15, status: 'OK' }
  ];
  ewsAlerts = [
    { customer: 'Trần Văn Bình', type: 'Payment Degradation', pd: 15.2, trigger: '3 late payments', severity: 'HIGH' },
    { customer: 'Nguyễn Thị Lan', type: 'Income Drop', pd: 8.5, trigger: 'Salary -30%', severity: 'MEDIUM' },
    { customer: 'Phạm Đức Hùng', type: 'Over-leverage', pd: 12.1, trigger: 'New debt +200M', severity: 'HIGH' },
    { customer: 'Lê Minh Tú', type: 'Industry Risk', pd: 6.8, trigger: 'Sector downgrade', severity: 'MEDIUM' }
  ];
  driftFeatures = [
    { name: 'Monthly Income', psi: 0.25, kl: 0.18, js: 0.12 }, { name: 'Outstanding Balance', psi: 0.15, kl: 0.10, js: 0.07 },
    { name: 'Payment History', psi: 0.06, kl: 0.04, js: 0.03 }, { name: 'Employment Duration', psi: 0.03, kl: 0.02, js: 0.01 },
    { name: 'Number of Inquiries', psi: 0.22, kl: 0.16, js: 0.11 }, { name: 'DTI Ratio', psi: 0.09, kl: 0.06, js: 0.04 }
  ];
}
