import { Component, OnInit } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule, Router } from '@angular/router'; import { FormsModule } from '@angular/forms'; import { MockDataService } from '../../core/services/mock-data.service'; import { AIModel } from '../../core/models/data.models';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
@Component({
  selector: 'app-model-registry', standalone: true, imports: [CommonModule, RouterModule, FormsModule, AgGridAngular],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Model Governance & Registry</h1><p class="page-subtitle">Module MG001-MG005 · ModelDB REST · Seldon/Kubeflow gRPC Deploy · MLOps</p></div><button class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Register Model</button></div>
    <div class="kpi-grid"><div class="kpi-card kpi-blue" style="padding:16px"><div class="kpi-label">Total Models</div><div class="kpi-value" style="font-size:1.6rem">{{all.length}}</div></div><div class="kpi-card kpi-green" style="padding:16px"><div class="kpi-label">Production</div><div class="kpi-value" style="font-size:1.6rem">{{prodCount}}</div></div><div class="kpi-card kpi-orange" style="padding:16px"><div class="kpi-label">Staging</div><div class="kpi-value" style="font-size:1.6rem">{{stagingCount}}</div></div><div class="kpi-card kpi-red" style="padding:16px"><div class="kpi-label">Avg AUC</div><div class="kpi-value" style="font-size:1.6rem">{{avgAuc}}</div></div></div>
    <div class="card" style="margin-bottom:16px"><div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
      <select [(ngModel)]="statusF" (change)="doFilter()" style="padding:10px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main);font-size:.85rem"><option value="">Tất cả status</option><option value="PRODUCTION">Production</option><option value="STAGING">Staging</option><option value="DEVELOPMENT">Development</option><option value="ARCHIVED">Archived</option></select>
      <select [(ngModel)]="typeF" (change)="doFilter()" style="padding:10px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main);font-size:.85rem"><option value="">Tất cả type</option><option value="CREDIT_RISK">Credit Risk</option><option value="FRAUD">Fraud</option><option value="BEHAVIORAL">Behavioral</option><option value="SEGMENTATION">Segmentation</option></select>
      <span class="badge badge-info">{{filtered.length}} models</span>
    </div></div>
    <div class="card" style="padding:0;overflow:hidden"><ag-grid-angular class="ag-theme-alpine" style="width:100%;height:520px" [rowData]="filtered" [columnDefs]="colDefs" [defaultColDef]="defaultColDef" [pagination]="true" [paginationPageSize]="10" (gridReady)="onGridReady($event)"></ag-grid-angular></div>
  </div>`, styles: ['']
})
export class ModelRegistryComponent implements OnInit {
    all: AIModel[] = []; filtered: AIModel[] = []; statusF = ''; typeF = ''; avgAuc = '0'; prodCount = 0; stagingCount = 0;

  public defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
  public colDefs: ColDef[] = [
    { field: 'name', headerName: 'Model', width: 160, cellRenderer: (p: any) => `<strong>${p.value}</strong>` },
    { field: 'version', headerName: 'Version', width: 100, cellRenderer: (p: any) => `<span style="font-family:var(--font-mono)">${p.value}</span>` },
    { field: 'platform', headerName: 'Platform', width: 130 },
    { field: 'type', headerName: 'Type', width: 130, cellRenderer: (p: any) => `<span class="badge badge-info">${p.value}</span>` },
    { field: 'metrics.auc', headerName: 'AUC', width: 90, cellRenderer: (p: any) => `<span style="font-weight:700">${p.value}</span>` },
    { field: 'metrics.f1', headerName: 'F1', width: 90 },
    { field: 'metrics.psi', headerName: 'PSI', width: 90, cellRenderer: (p: any) => { const v = p.value; return `<span style="color:${(v || 0) > 0.2 ? 'var(--brand-danger)' : 'var(--text-primary)'}">${v || '—'}</span>` } },
    { field: 'status', headerName: 'Status', width: 130, cellRenderer: (p: any) => `<span class="badge ${this.getStatusClass(p.value)}">${p.value}</span>` },
    { field: 'tags', headerName: 'Tags', flex: 1, minWidth: 200, cellRenderer: (p: any) => p.value.map((t: string) => `<span class="chip" style="margin:2px">${t}</span>`).join('') },
    { headerName: '', width: 80, cellRenderer: () => `<button class="btn btn-sm btn-secondary" style="padding:4px 8px"><i class="fas fa-eye"></i></button>`, onCellClicked: (p: any) => this.router.navigate(['/model-registry', p.data.id]) }
  ];

  onGridReady(params: GridReadyEvent) { params.api.sizeColumnsToFit(); }

  constructor(private m: MockDataService, private router: Router) { }
  ngOnInit() { this.all = this.m.getModels(); this.filtered = [...this.all]; this.avgAuc = (this.all.reduce((s, m) => s + m.metrics.auc, 0) / this.all.length).toFixed(3); this.prodCount = this.all.filter(m => m.status === 'PRODUCTION').length; this.stagingCount = this.all.filter(m => m.status === 'STAGING').length; }
  doFilter() { this.filtered = this.all.filter(m => (!this.statusF || m.status === this.statusF) && (!this.typeF || m.type === this.typeF)); }
  getStatusClass(s: string) { return { PRODUCTION: 'badge-success', STAGING: 'badge-info', DEVELOPMENT: 'badge-warning', ARCHIVED: 'badge-danger' }[s] || 'badge-info'; }
}
