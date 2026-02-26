import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { NgSelectModule } from '@ng-select/ng-select';
import { MockDataService } from '../../core/services/mock-data.service';
import { LoanApplication } from '../../core/models/data.models';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import * as LoanActions from '../../store/loans/loans.actions';
@Component({
  selector: 'app-loan-list', standalone: true, imports: [CommonModule, RouterModule, FormsModule, AgGridAngular, NgSelectModule],
  template: `
    <div class="page-container">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <div><h1 class="page-title">Tiếp nhận & Xử lý Đơn vay</h1><p class="page-subtitle">Module DV001-DV004 · Pipeline View · Pre-screening · AI Scoring · Kanban Board</p></div>
        <div style="display:flex;gap:10px">
          <div style="display:flex;gap:4px"><button class="btn btn-sm" [class]="viewMode==='table'?'btn-primary':'btn-secondary'" (click)="viewMode='table'"><i class="fas fa-list"></i></button><button class="btn btn-sm" [class]="viewMode==='kanban'?'btn-primary':'btn-secondary'" (click)="viewMode='kanban'"><i class="fas fa-columns"></i></button></div>
          <button class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Export</button>
          <button class="btn btn-primary" routerLink="/loans/new"><i class="fas fa-plus"></i> Tạo đơn vay</button>
        </div>
      </div>
      <div class="kpi-grid" style="grid-template-columns:repeat(6,1fr);margin-bottom:20px">
        @for(s of statusCounts;track s.status){<div class="kpi-card" style="padding:14px;cursor:pointer" [style.border-left]="s.status===statusF?'4px solid var(--brand-accent)':''" (click)="statusF=statusF===s.status?'':s.status;doFilter()"><div class="kpi-label">{{s.label}}</div><div style="font-size:1.5rem;font-weight:800;color:var(--brand-primary)">{{s.count}}</div></div>}
      </div>
      <div class="card" style="margin-bottom:16px"><div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
        <div style="display:flex;align-items:center;gap:8px;background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:8px;padding:0 12px;flex:1;min-width:200px"><i class="fas fa-search" style="color:var(--text-tertiary)"></i><input type="text" [(ngModel)]="search" placeholder="Tìm mã đơn, tên KH..." (input)="doFilter()" style="border:none;background:none;padding:10px 0;font-size:.85rem;width:100%;font-family:var(--font-main);outline:none"></div>
        <ng-select [(ngModel)]="productF" (change)="doFilter()" [items]="productOptions" bindLabel="label" bindValue="value" placeholder="Sản phẩm (ng-select)" [clearable]="true" style="min-width:180px"></ng-select>
        <select [(ngModel)]="assigneeF" (change)="doFilter()" style="padding:10px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main);font-size:.85rem"><option value="">Phân công</option><option value="analyst_tran">Trần Analyst</option><option value="officer_le">Lê Officer</option><option value="unassigned">Chưa phân công</option></select>
        <span class="badge badge-info">{{filtered.length}} hồ sơ</span>
      </div></div>

      @if(viewMode==='table'){
      <div class="card" style="padding:0;overflow:hidden"><ag-grid-angular class="ag-theme-alpine" style="width:100%;height:520px" [rowData]="filtered" [columnDefs]="colDefs" [defaultColDef]="defaultColDef" [pagination]="true" [paginationPageSize]="10" (gridReady)="onGridReady($event)"></ag-grid-angular></div>
      }
      @if(viewMode==='kanban'){
      <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;overflow-x:auto">
        @for(col of kanbanCols;track col.status){<div style="background:var(--bg-tertiary);border-radius:12px;padding:12px;min-width:200px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong style="font-size:.8rem">{{col.label}}</strong><span class="badge" [class]="col.badge">{{col.items.length}}</span></div>
          @for(item of col.items;track item.id){<div class="card" style="padding:12px;margin-bottom:8px;cursor:pointer;border-left:3px solid" [style.border-color]="col.color" [routerLink]="'/loans/'+item.id">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><strong style="font-size:.82rem;color:var(--brand-accent)">{{item.id}}</strong><span style="font-size:.7rem;font-weight:700">{{(item.amount/1e6).toFixed(0)}}M</span></div>
            <div style="font-size:.8rem;margin-bottom:4px">{{item.customerName}}</div>
            <div style="display:flex;justify-content:space-between;align-items:center"><span class="badge badge-info" style="font-size:.6rem">{{getProduct(item.productType)}}</span>@if(item.aiScore){<span style="font-size:.7rem;font-weight:700" [style.color]="item.aiScore.totalScore>=700?'var(--brand-success)':'var(--brand-warning)'">AI:{{item.aiScore.totalScore}}</span>}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px"><span style="font-size:.65rem;color:var(--text-tertiary)">{{item.assignedTo||'Chưa phân công'}}</span>@if(item.dti>35){<span class="badge badge-danger" style="font-size:.55rem">DTI {{item.dti}}%</span>}</div>
          </div>}
          @if(col.items.length===0){<div style="text-align:center;padding:20px;color:var(--text-tertiary);font-size:.8rem"><i class="fas fa-inbox" style="font-size:1.5rem;margin-bottom:4px;display:block"></i>Trống</div>}
        </div>}
      </div>}

      @if(showPreScreenModal()){<div class="modal-overlay" (click)="showPreScreenModal.set(false)"><div class="modal-content" style="max-width:600px" (click)="$event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;margin-bottom:20px"><h2><i class="fas fa-shield-alt" style="margin-right:8px;color:var(--brand-accent)"></i>Pre-screening (DV004)</h2><button class="btn btn-sm btn-secondary" (click)="showPreScreenModal.set(false)"><i class="fas fa-times"></i></button></div>
        <div style="margin-bottom:16px;padding:16px;background:var(--bg-tertiary);border-radius:10px"><strong>Hồ sơ:</strong> {{preScreenLoan?.id}} — {{preScreenLoan?.customerName}}<br><strong>Sản phẩm:</strong> {{getProduct(preScreenLoan?.productType||'')}} · {{(preScreenLoan?.amount||0)/1e6}}M</div>
        <h4 style="margin-bottom:12px">Kết quả kiểm tra tự động</h4>
        @for(c of preScreenChecks;track c.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border-light)"><div><strong>{{c.name}}</strong><br><small style="color:var(--text-tertiary)">{{c.desc}}</small></div><span class="badge" [class]="c.pass?'badge-success':'badge-danger'">{{c.pass?'PASS':'FAIL'}}</span></div>}
        <div style="margin-top:16px;padding:16px;border-radius:10px" [style.background]="allPreScreenPass?'#ECFDF5':'#FEF2F2'"><strong>Kết quả: </strong><span class="badge" [class]="allPreScreenPass?'badge-success':'badge-danger'" style="font-size:1rem;padding:6px 16px">{{allPreScreenPass?'PASS — Chuyển AI Scoring':'AUTO-REJECT'}}</span></div>
      </div></div>}
    </div>`,
  styles: ['.status-submitted{background:#E0E7FF;color:#3730A3}.status-pre_screening,.status-ai_scoring{background:#FEF3C7;color:#92400E}.status-reviewing{background:#EFF6FF;color:#1E40AF}.status-approved,.status-conditionally_approved{background:#ECFDF5;color:#065F46}.status-rejected{background:#FEF2F2;color:#991B1B}.status-disbursed{background:#F0FDF4;color:#166534}.status-draft{background:#F1F5F9;color:#475569}']
})
export class LoanListComponent implements OnInit {
  all: LoanApplication[] = []; filtered: LoanApplication[] = []; search = ''; statusF = ''; productF: string | null = null; assigneeF = '';
  viewMode: 'table' | 'kanban' = 'table';
  productOptions = [
    { value: 'CONSUMER', label: 'Tiêu dùng' },
    { value: 'MORTGAGE', label: 'Mua nhà' },
    { value: 'BUSINESS', label: 'SXKD' },
    { value: 'CREDIT_CARD', label: 'Thẻ TD' }
  ];
  statusCounts: { status: string; label: string; count: number }[] = [];
  kanbanCols: any[] = [];
  showPreScreenModal = signal(false); preScreenLoan: LoanApplication | null = null;
  preScreenChecks = [
    { name: 'CIC Blacklist Check', desc: 'Kiểm tra danh sách đen CIC', pass: true },
    { name: 'Nợ xấu nội bộ', desc: 'Kiểm tra nợ nhóm 3-5 nội bộ', pass: true },
    { name: 'Điều kiện tuổi', desc: 'Khách hàng 22-65 tuổi', pass: true },
    { name: 'Thu nhập tối thiểu', desc: 'Thu nhập ≥ 5M cho sản phẩm này', pass: true },
    { name: 'Hạn mức sản phẩm', desc: 'Khoản vay trong hạn mức cho phép', pass: true }
  ];
  allPreScreenPass = true;

  public defaultColDef: ColDef = { sortable: true, filter: true, resizable: true };
  public colDefs: ColDef[] = [
    { field: 'id', headerName: 'Mã đơn', width: 120, cellRenderer: (p: any) => `<strong style="color:var(--brand-accent);cursor:pointer">${p.value}</strong>`, onCellClicked: (p: any) => this.router.navigate(['/loans', p.value]) },
    { field: 'customerName', headerName: 'Khách hàng', width: 220, cellRenderer: (p: any) => `<div style="line-height:1.2"><strong>${p.value}</strong><br><small style="color:var(--text-tertiary)">${p.data.customerId}</small></div>` },
    { field: 'productType', headerName: 'Sản phẩm', width: 130, cellRenderer: (p: any) => `<span class="badge ${p.value === 'MORTGAGE' ? 'badge-tech' : p.value === 'BUSINESS' ? 'badge-warning' : 'badge-info'}">${this.getProduct(p.value)}</span>` },
    { field: 'amount', headerName: 'Số tiền', width: 120, cellRenderer: (p: any) => `<span style="font-weight:700">${(p.value / 1e6).toFixed(0)}M</span>` },
    { field: 'term', headerName: 'Kỳ hạn', width: 100, cellRenderer: (p: any) => `${p.value || '—'} th` },
    { field: 'interestRate', headerName: 'Lãi suất', width: 100, valueFormatter: p => `${p.value}%` },
    { field: 'dti', headerName: 'DTI', width: 90, cellRenderer: (p: any) => `<span style="font-weight:600;color:${p.value > 40 ? 'var(--brand-danger)' : 'var(--text-primary)'}">${p.value}%</span>` },
    { field: 'aiScore', headerName: 'AI Score', width: 110, cellRenderer: (p: any) => { if (!p.value) return `<span style="color:var(--text-tertiary)">—</span>`; const s = p.value.totalScore; const color = s >= 700 ? 'var(--brand-success)' : s >= 500 ? 'var(--brand-warning)' : 'var(--brand-danger)'; return `<span style="font-weight:800;color:${color}">${s}</span>`; } },
    { field: 'preScreenResult', headerName: 'Pre-screen', width: 120, cellRenderer: (p: any) => { if (!p.value) return `<span style="color:var(--text-tertiary)">—</span>`; const st = p.value.status; const cls = st === 'PASS' ? 'badge-success' : st === 'CONDITIONAL' ? 'badge-warning' : 'badge-danger'; return `<span class="badge ${cls}">${st}</span>`; } },
    { field: 'status', headerName: 'Trạng thái', width: 140, cellRenderer: (p: any) => `<span class="status-badge status-${p.value.toLowerCase()}">${this.getStatus(p.value)}</span>` },
    { field: 'assignedTo', headerName: 'Phân công', width: 130, cellRenderer: (p: any) => p.value ? `<span style="font-size:.82rem">${p.value}</span>` : `<span style="color:var(--text-tertiary)">—</span>` },
    { headerName: '', width: 80, cellRenderer: () => `<button class="btn btn-sm btn-secondary" style="padding:4px 8px"><i class="fas fa-eye"></i></button>`, onCellClicked: (p: any) => this.router.navigate(['/loans', p.data.id]) }
  ];

  onGridReady(params: GridReadyEvent) { params.api.sizeColumnsToFit(); }

  constructor(private m: MockDataService, private router: Router, private store: Store) { }
  ngOnInit() {
    this.all = this.m.getLoans(); this.filtered = [...this.all];
    this.store.dispatch(LoanActions.loadLoansSuccess({ loans: this.all }));
    const c: Record<string, number> = {}; this.all.forEach(l => c[l.status] = (c[l.status] || 0) + 1);
    this.statusCounts = [{ status: 'SUBMITTED', label: 'Nộp mới', count: c['SUBMITTED'] || 0 }, { status: 'AI_SCORING', label: 'AI Scoring', count: c['AI_SCORING'] || 0 }, { status: 'REVIEWING', label: 'Thẩm định', count: c['REVIEWING'] || 0 }, { status: 'APPROVED', label: 'Đã duyệt', count: (c['APPROVED'] || 0) + (c['CONDITIONALLY_APPROVED'] || 0) }, { status: 'REJECTED', label: 'Từ chối', count: c['REJECTED'] || 0 }, { status: 'DISBURSED', label: 'Giải ngân', count: c['DISBURSED'] || 0 }];
    this.buildKanban();
  }
  buildKanban() {
    this.kanbanCols = [
      { status: 'SUBMITTED', label: 'Tiếp nhận', badge: 'badge-info', color: '#6366F1', items: this.filtered.filter(l => l.status === 'SUBMITTED' || l.status === 'DRAFT') },
      { status: 'AI_SCORING', label: 'AI Scoring', badge: 'badge-warning', color: '#F59E0B', items: this.filtered.filter(l => l.status === 'AI_SCORING' || l.status === 'PRE_SCREENING') },
      { status: 'REVIEWING', label: 'Thẩm định', badge: 'badge-info', color: '#2563EB', items: this.filtered.filter(l => l.status === 'REVIEWING') },
      { status: 'APPROVED', label: 'Đã duyệt', badge: 'badge-success', color: '#059669', items: this.filtered.filter(l => l.status === 'APPROVED' || l.status === 'CONDITIONALLY_APPROVED') },
      { status: 'REJECTED', label: 'Từ chối', badge: 'badge-danger', color: '#DC2626', items: this.filtered.filter(l => l.status === 'REJECTED') },
      { status: 'DISBURSED', label: 'Giải ngân', badge: 'badge-success', color: '#10B981', items: this.filtered.filter(l => l.status === 'DISBURSED') }
    ];
  }
  doFilter() { this.filtered = this.all.filter(l => (!this.search || l.id.toLowerCase().includes(this.search.toLowerCase()) || l.customerName.toLowerCase().includes(this.search.toLowerCase())) && (!this.statusF || l.status === this.statusF || l.status === 'CONDITIONALLY_APPROVED' && this.statusF === 'APPROVED') && (!this.productF || l.productType === this.productF)); this.buildKanban(); }
  getProduct(t: string) { return { CONSUMER: 'Tiêu dùng', MORTGAGE: 'Mua nhà', BUSINESS: 'SXKD', CREDIT_CARD: 'Thẻ TD' }[t] || t; }
  getStatus(s: string) { return { DRAFT: 'Nháp', SUBMITTED: 'Nộp mới', PRE_SCREENING: 'Pre-screen', AI_SCORING: 'AI Scoring', REVIEWING: 'Thẩm định', APPROVED: 'Đã duyệt', CONDITIONALLY_APPROVED: 'Duyệt ĐK', REJECTED: 'Từ chối', DISBURSED: 'Giải ngân' }[s] || s; }
  openPreScreen(l: LoanApplication) { this.preScreenLoan = l; this.showPreScreenModal.set(true); }
}
