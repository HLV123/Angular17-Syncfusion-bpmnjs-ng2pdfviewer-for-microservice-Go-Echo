import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Customer } from '../../core/models/data.models';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';

@Component({
  selector: 'app-customer-list', standalone: true, imports: [CommonModule, RouterModule, FormsModule, AgGridAngular],
  template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <div><h1 class="page-title">Hồ sơ Khách hàng (CRM 360°)</h1><p class="page-subtitle">Module KH001-KH004 · ag-Grid · OCR/eKYC · Leaflet · Full-text Search</p></div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Export</button>
          <button class="btn btn-primary btn-sm" (click)="showAddModal.set(true)"><i class="fas fa-plus"></i> Thêm KH</button>
        </div>
      </div>
      <div class="kpi-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">
        <div class="kpi-card kpi-blue" style="padding:16px 20px"><div class="kpi-label">Tổng KH</div><div class="kpi-value" style="font-size:1.6rem">{{all.length}}</div></div>
        <div class="kpi-card kpi-green" style="padding:16px 20px"><div class="kpi-label">eKYC ✓</div><div class="kpi-value" style="font-size:1.6rem">{{ekyCount}}</div></div>
        <div class="kpi-card kpi-orange" style="padding:16px 20px"><div class="kpi-label">Điểm TB</div><div class="kpi-value" style="font-size:1.6rem">{{avgScore}}</div></div>
        <div class="kpi-card kpi-red" style="padding:16px 20px"><div class="kpi-label">Tổng dư nợ</div><div class="kpi-value" style="font-size:1.6rem">{{totalDebt}}B</div></div>
        <div class="kpi-card" style="padding:16px 20px;border-left:4px solid var(--brand-info)"><div class="kpi-label">Có tài liệu</div><div class="kpi-value" style="font-size:1.6rem">{{docCount}}</div></div>
      </div>
      <div class="card" style="margin-bottom:16px"><div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <div style="display:flex;align-items:center;gap:8px;background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:8px;padding:0 12px;flex:1;min-width:200px">
          <i class="fas fa-search" style="color:var(--text-tertiary)"></i>
          <input type="text" [(ngModel)]="search" placeholder="Tìm tên, CCCD, SĐT, email..." (input)="doFilter()" style="border:none;background:none;padding:10px 0;font-size:.85rem;width:100%;font-family:var(--font-main);outline:none">
        </div>
        <select [(ngModel)]="typeF" (change)="doFilter()" style="padding:10px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main);font-size:.85rem"><option value="">Loại KH</option><option value="INDIVIDUAL">Cá nhân</option><option value="HOUSEHOLD">Hộ KD</option><option value="SME">SME</option></select>
        <select [(ngModel)]="provinceF" (change)="doFilter()" style="padding:10px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main);font-size:.85rem"><option value="">Tỉnh/TP</option>@for(p of provinces;track p){<option [value]="p">{{p}}</option>}</select>
        <select [(ngModel)]="scoreF" (change)="doFilter()" style="padding:10px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main);font-size:.85rem"><option value="">Điểm</option><option value="high">≥700</option><option value="mid">500-699</option><option value="low">&lt;500</option></select>
        <span class="badge badge-info">{{filtered.length}}/{{all.length}}</span>
        <div style="display:flex;gap:4px"><button class="btn btn-sm" [class]="viewMode==='table'?'btn-primary':'btn-secondary'" (click)="viewMode='table'" style="padding:6px 10px"><i class="fas fa-list"></i></button><button class="btn btn-sm" [class]="viewMode==='card'?'btn-primary':'btn-secondary'" (click)="viewMode='card'" style="padding:6px 10px"><i class="fas fa-th-large"></i></button></div>
      </div></div>
      @if(viewMode==='table'){<div class="card" style="padding:0;overflow:hidden"><ag-grid-angular class="ag-theme-alpine" style="width:100%;height:520px" [rowData]="filtered" [columnDefs]="colDefs" [defaultColDef]="defaultColDef" [pagination]="true" [paginationPageSize]="10" (gridReady)="onGridReady($event)"></ag-grid-angular></div>}
      @if(viewMode==='card'){<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">
        @for(c of filtered;track c.id){<div class="card" style="padding:20px;cursor:pointer" [routerLink]="'/customers/'+c.id">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><div style="width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.9rem;color:#fff" [style.background]="c.gender==='F'?'#EC4899':'#2563EB'">{{c.fullName.split(' ').pop()?.[0]}}</div><div style="flex:1"><strong>{{c.fullName}}</strong><div style="font-size:.75rem;color:var(--text-tertiary)">{{c.id}} · {{c.province}}</div></div><span class="badge" [class]="c.status==='ACTIVE'?'badge-success':'badge-danger'" style="font-size:.65rem">{{c.status}}</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:.82rem"><div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:8px"><div style="font-size:1.15rem;font-weight:800" [style.color]="getScoreColor(c.internalScore)">{{c.internalScore}}</div><small style="color:var(--text-tertiary)">Score</small></div><div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:8px"><div style="font-size:1.15rem;font-weight:800">{{c.cicScore||'-'}}</div><small style="color:var(--text-tertiary)">CIC</small></div><div style="text-align:center;padding:8px;background:var(--bg-tertiary);border-radius:8px"><div style="font-size:1.15rem;font-weight:800">{{formatMoney(c.totalOutstanding)}}</div><small style="color:var(--text-tertiary)">Dư nợ</small></div></div>
        </div>}</div>}
      @if(showAddModal()){<div class="modal-overlay" (click)="showAddModal.set(false)"><div class="modal-content" (click)="$event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;margin-bottom:24px"><h2>Thêm khách hàng mới</h2><button class="btn btn-sm btn-secondary" (click)="showAddModal.set(false)"><i class="fas fa-times"></i></button></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div class="form-group"><label>Họ tên *</label><input type="text" placeholder="Nguyễn Văn A"></div><div class="form-group"><label>CCCD *</label><input type="text" placeholder="001200012345"></div><div class="form-group"><label>Ngày sinh</label><input type="date"></div><div class="form-group"><label>Giới tính</label><select><option>Nam</option><option>Nữ</option></select></div><div class="form-group"><label>SĐT *</label><input type="text" placeholder="09xxxxxxxx"></div><div class="form-group"><label>Email</label><input type="email"></div><div class="form-group" style="grid-column:span 2"><label>Địa chỉ</label><input type="text" placeholder="Số nhà, đường, phường/xã"></div></div>
        <div style="border:2px dashed var(--border-light);border-radius:12px;padding:24px;text-align:center;color:var(--text-tertiary);margin:16px 0"><i class="fas fa-id-card" style="font-size:2rem;margin-bottom:8px;display:block"></i><p>Upload CCCD mặt trước & sau → OCR tự động</p></div>
        <div style="display:flex;gap:12px;justify-content:flex-end"><button class="btn btn-secondary" (click)="showAddModal.set(false)">Hủy</button><button class="btn btn-primary" (click)="showAddModal.set(false)"><i class="fas fa-save"></i> Lưu</button></div>
      </div></div>}
    </div>`, styles: ['']
})
export class CustomerListComponent implements OnInit {
  all: Customer[] = []; filtered: Customer[] = []; search = ''; typeF = ''; provinceF = ''; scoreF = ''; ekycF = '';
  viewMode: 'table' | 'card' = 'table'; showAddModal = signal(false); provinces: string[] = [];
  avgScore = 0; ekyCount = 0; totalDebt = '0'; docCount = 0;
  constructor(private m: MockDataService, private router: Router) { }

  public defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
  public colDefs: ColDef[] = [
    { field: 'id', headerName: 'Mã KH', width: 120, cellRenderer: (p: any) => `<strong style="color:var(--brand-accent);cursor:pointer">${p.value}</strong>`, onCellClicked: (p: any) => this.router.navigate(['/customers', p.value]) },
    {
      field: 'fullName', headerName: 'Họ tên', width: 220, cellRenderer: (p: any) => {
        const c = p.data; const init = c.fullName.split(' ').pop()?.[0] || ''; const bg = c.gender === 'F' ? '#EC4899' : '#2563EB';
        return `<div style="display:flex;align-items:center;gap:10px"><div style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.7rem;color:#fff;background:${bg}">${init}</div><div style="line-height:1.2"><strong>${c.fullName}</strong><br><small style="color:var(--text-tertiary)">${c.email}</small></div></div>`;
      }
    },
    { field: 'cccd', headerName: 'CCCD', width: 140 },
    { field: 'phone', headerName: 'SĐT', width: 130 },
    { field: 'province', headerName: 'Tỉnh', width: 140 },
    { field: 'customerType', headerName: 'Loại', width: 120, cellRenderer: (p: any) => `<span class="badge ${p.value === 'SME' ? 'badge-tech' : p.value === 'HOUSEHOLD' ? 'badge-warning' : 'badge-info'}">${this.getType(p.value)}</span>` },
    { field: 'internalScore', headerName: 'Điểm', width: 100, cellRenderer: (p: any) => `<span style="font-weight:700;color:${this.getScoreColor(p.value)}">${p.value}</span>` },
    { field: 'cicScore', headerName: 'CIC', width: 100, valueFormatter: p => p.value || '-' },
    { field: 'totalOutstanding', headerName: 'Dư nợ', width: 120, cellRenderer: (p: any) => `<span style="font-weight:600">${this.formatMoney(p.value)}</span>` },
    { field: 'ekycVerified', headerName: 'eKYC', width: 100, cellRenderer: (p: any) => p.value ? `<span class="badge badge-success"><i class="fas fa-check"></i></span>` : `<span class="badge badge-warning">—</span>` },
    { field: 'status', headerName: 'TT', width: 120, cellRenderer: (p: any) => `<span class="badge ${p.value === 'ACTIVE' ? 'badge-success' : 'badge-danger'}">${p.value}</span>` },
    { headerName: '', width: 80, cellRenderer: () => `<button class="btn btn-sm btn-secondary" style="padding:4px 8px"><i class="fas fa-eye"></i></button>`, onCellClicked: (p: any) => this.router.navigate(['/customers', p.data.id]) }
  ];

  onGridReady(params: GridReadyEvent) { params.api.sizeColumnsToFit(); }

  ngOnInit() {
    this.all = this.m.getCustomers(); this.filtered = [...this.all];
    this.provinces = [...new Set(this.all.map(c => c.province))].sort();
    this.avgScore = Math.round(this.all.reduce((s, c) => s + c.internalScore, 0) / this.all.length);
    this.ekyCount = this.all.filter(c => c.ekycVerified).length;
    this.totalDebt = (this.all.reduce((s, c) => s + c.totalOutstanding, 0) / 1e9).toFixed(1);
    this.docCount = this.all.filter(c => c.documents.length > 0).length;
  }
  doFilter() { this.filtered = this.all.filter(c => { const s = this.search.toLowerCase(); return (!s || c.fullName.toLowerCase().includes(s) || c.cccd.includes(s) || c.phone.includes(s) || c.id.toLowerCase().includes(s)) && (!this.typeF || c.customerType === this.typeF) && (!this.provinceF || c.province === this.provinceF) && (!this.scoreF || (this.scoreF === 'high' && c.internalScore >= 700) || (this.scoreF === 'mid' && c.internalScore >= 500 && c.internalScore < 700) || (this.scoreF === 'low' && c.internalScore < 500)); }); }
  getType(t: string) { return { INDIVIDUAL: 'Cá nhân', HOUSEHOLD: 'Hộ KD', SME: 'SME' }[t] || t; }
  getScoreColor(s: number) { return s >= 700 ? 'var(--brand-success)' : s >= 500 ? 'var(--brand-warning)' : 'var(--brand-danger)'; }
  formatMoney(v: number) { return v >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : (v / 1e6).toFixed(0) + 'M'; }
}
