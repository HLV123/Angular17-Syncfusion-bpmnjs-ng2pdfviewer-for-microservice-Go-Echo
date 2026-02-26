import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule } from '@angular/router'; import { MockDataService } from '../../core/services/mock-data.service';
import * as d3 from 'd3';
@Component({
  selector: 'app-explainability-dashboard', standalone: true, imports: [CommonModule, RouterModule],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">AI Explainability (XAI)</h1><p class="page-subtitle">Module XAI001-XAI005 · SHAP · LIME · DiCE · CEM · D3.js Visualization</p></div><button class="btn btn-primary btn-sm"><i class="fas fa-file-pdf"></i> Export PDF (XAI005)</button></div>
    <div class="kpi-grid"><div class="kpi-card kpi-blue" style="padding:16px"><div class="kpi-label">XAI Methods</div><div class="kpi-value" style="font-size:1.6rem">4</div></div>
      <div class="kpi-card kpi-green" style="padding:16px"><div class="kpi-label">Explanations Today</div><div class="kpi-value" style="font-size:1.6rem">47</div></div>
      <div class="kpi-card kpi-orange" style="padding:16px"><div class="kpi-label">Top Feature</div><div class="kpi-value" style="font-size:1rem">Payment History</div></div>
      <div class="kpi-card kpi-red" style="padding:16px"><div class="kpi-label">Avg Explanation Time</div><div class="kpi-value" style="font-size:1.4rem">1.2s</div></div></div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="tab==='methods'" (click)="tab='methods'">XAI Methods</div>
      <div class="tab-item" [class.active]="tab==='global'" (click)="tab='global';createD3Chart()">Global Importance (D3.js)</div>
      <div class="tab-item" [class.active]="tab==='heatmap'" (click)="tab='heatmap';drawHeatmap()">Correlation Heatmap (XAI004)</div>
      <div class="tab-item" [class.active]="tab==='recent'" (click)="tab='recent'">Recent Explanations</div>
    </div>
    @if(tab==='methods'){<div class="row-flex">@for(m of methods;track m.name){<div class="card col-6">
      <div class="card-header"><h3><i class="fas fa-lightbulb"></i> {{m.name}}</h3><span class="badge" [class]="m.status==='Active'?'badge-success':'badge-info'">{{m.status}}</span></div>
      <p style="font-size:.85rem;color:var(--text-secondary);margin-bottom:12px">{{m.desc}}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:.85rem"><div><small style="color:var(--text-tertiary)">Type</small><br><strong>{{m.type}}</strong></div><div><small style="color:var(--text-tertiary)">Avg Time</small><br><strong>{{m.time}}</strong></div></div>
    </div>}</div>}
    @if(tab==='global'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-chart-bar"></i> Global Feature Importance (SHAP)</h3><span class="badge badge-tech">D3.js</span></div>
      <div #featureChart style="height:320px;overflow:hidden"></div>
    </div>}
    @if(tab==='heatmap'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-th"></i> Feature Correlation Heatmap (XAI004)</h3><span class="badge badge-tech">D3.js</span></div>
      <div #heatmapChart style="height:400px;overflow:hidden"></div>
    </div>}
    @if(tab==='recent'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-list"></i> Recent Explanations (XAI002)</h3></div>
      <table class="data-table"><thead><tr><th>Time</th><th>Loan</th><th>Score</th><th>Top Positive</th><th>Top Negative</th><th>Counterfactual</th><th></th></tr></thead><tbody>
        @for(e of recent;track e.id){<tr><td style="font-size:.82rem">{{e.time}}</td><td><strong style="color:var(--brand-accent)">{{e.id}}</strong></td><td style="font-weight:800" [style.color]="e.score>=700?'var(--brand-success)':'var(--brand-warning)'">{{e.score}}</td><td><span class="badge badge-success" style="font-size:.7rem">{{e.pos}}</span></td><td><span class="badge badge-danger" style="font-size:.7rem">{{e.neg}}</span></td><td style="font-size:.78rem">{{e.cf}}</td><td><button class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i></button></td></tr>}
      </tbody></table>
    </div>}
  </div>`, styles: ['']
})
export class ExplainabilityDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('featureChart') featureChart!: ElementRef;
  @ViewChild('heatmapChart') heatmapChart!: ElementRef;
  tab = 'methods';
  features = [{ name: 'Payment History', importance: 0.32 }, { name: 'Income Level', importance: 0.21 }, { name: 'Outstanding Balance', importance: -0.19 }, { name: 'Employment Duration', importance: 0.15 }, { name: 'DTI Ratio', importance: -0.14 }, { name: 'Age', importance: 0.10 }, { name: 'Num Accounts', importance: 0.06 }, { name: 'Credit Utilization', importance: -0.05 }];
  methods = [{ name: 'SHAP (SHapley Additive exPlanations)', desc: 'Computes feature contributions using game-theoretic Shapley values.', type: 'Local + Global', time: '0.8s', status: 'Active' }, { name: 'LIME (Local Interpretable Model-agnostic)', desc: 'Builds interpretable surrogate models for individual predictions.', type: 'Local', time: '1.2s', status: 'Active' }, { name: 'DiCE (Diverse Counterfactual Explanations)', desc: 'Generates actionable recommendations by finding minimal changes.', type: 'Counterfactual', time: '2.0s', status: 'Active' }, { name: 'CEM (Contrastive Explanation Method)', desc: 'Identifies pertinent positives and negatives for predictions.', type: 'Contrastive', time: '1.5s', status: 'Active' }];
  heatmapFeatures = ['Payment', 'Income', 'Balance', 'Employment', 'DTI', 'Age', 'Accounts', 'Utilization'];
  correlations = [[1, .3, -.2, .4, -.5, .2, .1, -.3], [.3, 1, -.1, .6, -.7, .3, .2, -.2], [-.2, -.1, 1, -.1, .4, -.1, .3, .8], [.4, .6, -.1, 1, -.3, .5, .2, -.1], [-.5, -.7, .4, -.3, 1, -.2, .1, .3], [.2, .3, -.1, .5, -.2, 1, .1, -.1], [.1, .2, .3, .2, .1, .1, 1, .2], [-.3, -.2, .8, -.1, .3, -.1, .2, 1]];
  recent = [{ id: 'LV-2435', score: 731, time: '09:41', pos: 'Payment +0.43', neg: 'Balance -0.19', cf: 'Income +2.2M → 760+' }, { id: 'LV-2436', score: 810, time: '09:05', pos: 'Income +0.38', neg: 'DTI -0.08', cf: 'N/A (auto-approve)' }, { id: 'LV-2437', score: 480, time: '11:00', pos: 'Age +0.05', neg: 'Payment -0.45', cf: 'Clear late payments → 600+' }, { id: 'LV-2439', score: 780, time: '10:15', pos: 'Employment +0.35', neg: 'Utilization -0.12', cf: 'Reduce utilization <50%' }, { id: 'LV-2442', score: 650, time: '10:00', pos: 'Payment +0.25', neg: 'Income -0.22', cf: 'Income +5M → 720+' }];
  constructor(private m: MockDataService) { } ngOnInit() { } ngAfterViewInit() { }
  createD3Chart() { setTimeout(() => { if (!this.featureChart) return; const el = this.featureChart.nativeElement; el.innerHTML = ''; const w = el.clientWidth, h = 300, margin = { top: 10, right: 30, bottom: 20, left: 120 }; const svg = d3.select(el).append('svg').attr('width', w).attr('height', h); const x = d3.scaleLinear().domain([-.5, .5]).range([margin.left, w - margin.right]); const y = d3.scaleBand().domain(this.features.map(f => f.name)).range([margin.top, h - margin.bottom]).padding(.2); svg.append('g').attr('transform', `translate(0,${h - margin.bottom})`).call(d3.axisBottom(x).ticks(6)); svg.append('g').attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y)); svg.selectAll('rect').data(this.features).join('rect').attr('x', (d: any) => Math.min(x(0), x(d.importance))).attr('y', (d: any) => y(d.name) as number).attr('width', (d: any) => Math.abs(x(d.importance) - x(0))).attr('height', y.bandwidth()).attr('fill', (d: any) => d.importance > 0 ? '#2563EB' : '#DC2626').attr('rx', 3); }, 200); }
  drawHeatmap() { setTimeout(() => { if (!this.heatmapChart) return; const el = this.heatmapChart.nativeElement; el.innerHTML = ''; const n = this.heatmapFeatures.length, w = el.clientWidth, cellSize = Math.min(40, (w - 100) / n), margin = { top: 60, left: 100 }; const svg = d3.select(el).append('svg').attr('width', margin.left + cellSize * n + 20).attr('height', margin.top + cellSize * n + 20); const color = d3.scaleLinear<string>().domain([-1, 0, 1]).range(['#DC2626', '#F1F5F9', '#2563EB']); for (let i = 0; i < n; i++) { svg.append('text').attr('x', margin.left + i * cellSize + cellSize / 2).attr('y', margin.top - 8).text(this.heatmapFeatures[i]).style('text-anchor', 'middle').style('font-size', '10px'); svg.append('text').attr('x', margin.left - 8).attr('y', margin.top + i * cellSize + cellSize / 2 + 4).text(this.heatmapFeatures[i]).style('text-anchor', 'end').style('font-size', '10px'); for (let j = 0; j < n; j++) { const v = this.correlations[i][j]; svg.append('rect').attr('x', margin.left + j * cellSize).attr('y', margin.top + i * cellSize).attr('width', cellSize - 2).attr('height', cellSize - 2).attr('fill', color(v)).attr('rx', 3); svg.append('text').attr('x', margin.left + j * cellSize + cellSize / 2 - 1).attr('y', margin.top + i * cellSize + cellSize / 2 + 4).text(v.toFixed(1)).style('text-anchor', 'middle').style('font-size', '9px').style('fill', Math.abs(v) > 0.5 ? '#fff' : '#333'); } } }, 200); }
}
