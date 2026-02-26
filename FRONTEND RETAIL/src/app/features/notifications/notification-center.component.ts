import { Component, OnInit, signal } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule } from '@angular/router'; import { FormsModule } from '@angular/forms'; import { MockDataService } from '../../core/services/mock-data.service';
@Component({
  selector: 'app-notification-center', standalone: true, imports: [CommonModule, RouterModule, FormsModule],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Cảnh Báo & Thông Báo</h1><p class="page-subtitle">Module NF001-NF004 · WebSocket (STOMP) · Real-time Push · Alert Dashboard</p></div><div style="display:flex;gap:8px"><button class="btn btn-secondary btn-sm" (click)="markAllRead()"><i class="fas fa-check-double"></i> Đọc tất cả</button><button class="btn btn-primary btn-sm" (click)="tab='settings'"><i class="fas fa-cog"></i> Settings</button></div></div>
    <div class="kpi-grid"><div class="kpi-card kpi-blue" style="padding:16px"><div class="kpi-label">Total</div><div class="kpi-value" style="font-size:1.6rem">{{all.length}}</div></div>
      <div class="kpi-card kpi-red" style="padding:16px"><div class="kpi-label">Unread</div><div class="kpi-value" style="font-size:1.6rem">{{unreadCount}}</div></div>
      <div class="kpi-card kpi-orange" style="padding:16px"><div class="kpi-label">Action Required</div><div class="kpi-value" style="font-size:1.6rem">{{actionCount}}</div></div>
      <div class="kpi-card kpi-green" style="padding:16px"><div class="kpi-label">Today</div><div class="kpi-value" style="font-size:1.6rem">{{todayCount}}</div></div></div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="tab==='all'" (click)="tab='all'">Tất cả</div>
      <div class="tab-item" [class.active]="tab==='unread'" (click)="tab='unread'">Chưa đọc ({{unreadCount}})</div>
      <div class="tab-item" [class.active]="tab==='action'" (click)="tab='action'">Cần hành động</div>
      <div class="tab-item" [class.active]="tab==='alerts'" (click)="tab='alerts'">Alert Dashboard (NF004)</div>
      <div class="tab-item" [class.active]="tab==='settings'" (click)="tab='settings'">Settings (NF003)</div>
    </div>
    @if(tab==='all'||tab==='unread'||tab==='action'){<div class="card">
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        @for(f of filterTypes;track f.value){<button class="btn btn-sm" [class]="typeFilter===f.value?'btn-primary':'btn-secondary'" (click)="typeFilter=f.value" style="font-size:.78rem">{{f.icon}} {{f.label}} ({{f.count}})</button>}
      </div>
      @for(n of getFiltered();track n.id){<div style="display:flex;gap:12px;padding:14px;border-bottom:1px solid var(--border-light);cursor:pointer" [style.background]="!n.read?'#EFF6FF':'transparent'" (click)="n.read=true;updateCounts()">
        <div style="width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0" [style.background]="getTypeColor(n.type)"><i [class]="getTypeIcon(n.type)" style="color:#fff;font-size:.9rem"></i></div>
        <div style="flex:1"><div style="display:flex;justify-content:space-between"><strong style="font-size:.9rem">{{n.title}}</strong><small style="color:var(--text-tertiary)">{{n.time}}</small></div><p style="font-size:.82rem;color:var(--text-secondary);margin:4px 0">{{n.message}}</p><div style="display:flex;gap:6px">@if(!n.read){<span class="badge badge-info" style="font-size:.6rem">New</span>}<span class="badge" [class]="n.type==='alert'?'badge-danger':n.type==='loan'?'badge-info':n.type==='model'?'badge-tech':'badge-warning'" style="font-size:.6rem">{{n.type}}</span>@if(n.actionRequired){<span class="badge badge-warning" style="font-size:.6rem">Action Required</span>}</div></div>
      </div>}
      @if(getFiltered().length===0){<div style="text-align:center;padding:40px;color:var(--text-tertiary)"><i class="fas fa-bell-slash" style="font-size:2rem;margin-bottom:8px;display:block"></i>Không có thông báo nào</div>}
    </div>}
    @if(tab==='alerts'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-bell"></i> Alert Dashboard (NF004)</h3></div>
      <div class="row-flex">
        <div class="col-6"><h4 style="margin-bottom:12px">By Severity</h4>@for(s of alertBySeverity;track s.label){<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="width:60px;font-size:.82rem">{{s.label}}</span><div class="progress-bar" style="flex:1;height:12px"><div class="progress-fill" [style.background]="s.color" [style.width.%]="s.pct"></div></div><strong style="width:30px;text-align:right">{{s.count}}</strong></div>}</div>
        <div class="col-6"><h4 style="margin-bottom:12px">By Category</h4>@for(c of alertByCategory;track c.label){<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-light);font-size:.85rem"><span>{{c.label}}</span><strong>{{c.count}}</strong></div>}</div>
      </div>
      <h4 style="margin-top:20px;margin-bottom:12px">Recent Alerts (24h)</h4>
      <table class="data-table"><thead><tr><th>Time</th><th>Severity</th><th>Category</th><th>Message</th><th>Source</th><th></th></tr></thead><tbody>
        @for(a of recentAlerts;track a.ts){<tr><td style="font-family:var(--font-mono);font-size:.78rem">{{a.ts}}</td><td><span class="badge" [class]="a.severity==='CRITICAL'?'badge-danger':a.severity==='WARNING'?'badge-warning':'badge-info'">{{a.severity}}</span></td><td>{{a.category}}</td><td style="font-size:.82rem">{{a.message}}</td><td style="font-size:.78rem">{{a.source}}</td><td><button class="btn btn-sm btn-secondary"><i class="fas fa-check"></i></button></td></tr>}
      </tbody></table>
    </div>}
    @if(tab==='settings'){<div class="card">
      <div class="card-header"><h3><i class="fas fa-cog"></i> Notification Settings (NF003)</h3></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div style="padding:16px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px">Notification Channels</h4>
          @for(c of channels;track c.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light)"><div><strong>{{c.name}}</strong><br><small style="color:var(--text-tertiary)">{{c.desc}}</small></div><label style="position:relative;display:inline-block;width:44px;height:24px"><input type="checkbox" [(ngModel)]="c.enabled" style="opacity:0;width:0;height:0"><span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;border-radius:12px;transition:.3s" [style.background]="c.enabled?'var(--brand-success)':'#CBD5E1'"></span></label></div>}
        </div>
        <div style="padding:16px;background:var(--bg-tertiary);border-radius:12px"><h4 style="margin-bottom:12px">Alert Categories</h4>
          @for(c of alertCategories;track c.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-light)"><div><strong>{{c.name}}</strong><br><small style="color:var(--text-tertiary)">{{c.threshold}}</small></div><select [(ngModel)]="c.level" style="padding:4px 8px;border:1px solid var(--border-light);border-radius:6px;font-size:.82rem"><option>All</option><option>Critical only</option><option>Off</option></select></div>}
        </div>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn btn-primary"><i class="fas fa-save"></i> Save Settings</button></div>
    </div>}
  </div>`, styles: ['']
})
export class NotificationCenterComponent implements OnInit {
  tab = 'all'; typeFilter = '';
  all: any[] = []; unreadCount = 0; actionCount = 0; todayCount = 0;
  filterTypes: any[] = [];
  channels = [{ name: 'In-App Notifications', desc: 'Push notifications within the app', enabled: true }, { name: 'Email Alerts', desc: 'Send critical alerts via email', enabled: true }, { name: 'SMS (Critical)', desc: 'SMS for critical priority only', enabled: false }, { name: 'Slack/Teams Webhook', desc: 'Forward to Slack channel', enabled: true }];
  alertCategories = [{ name: 'Loan Status Changes', threshold: 'All status transitions', level: 'All' }, { name: 'AI Model Alerts', threshold: 'PSI > 0.20, AUC drop > 2%', level: 'All' }, { name: 'EWS Warnings', threshold: 'Score drop > 30 pts', level: 'Critical only' }, { name: 'Compliance Events', threshold: 'Any regulatory change', level: 'All' }, { name: 'Adversarial Attacks', threshold: 'Any detected attack', level: 'All' }];
  alertBySeverity = [{ label: 'Critical', count: 3, color: '#DC2626', pct: 25 }, { label: 'Warning', count: 5, color: '#F59E0B', pct: 42 }, { label: 'Info', count: 4, color: '#2563EB', pct: 33 }];
  alertByCategory = [{ label: 'Loan Processing', count: 4 }, { label: 'AI Model Health', count: 3 }, { label: 'EWS / Risk', count: 2 }, { label: 'Compliance', count: 2 }, { label: 'System', count: 1 }];
  recentAlerts = [{ ts: '09:45', severity: 'CRITICAL', category: 'EWS', message: 'Customer Trần Văn B: 3 consecutive late payments', source: 'EWS Engine' }, { ts: '09:30', severity: 'WARNING', category: 'AI Model', message: 'PSI for Credit Risk model increased to 0.18', source: 'Monitoring' }, { ts: '08:15', severity: 'WARNING', category: 'System', message: 'API latency spike on Seldon Core endpoint', source: 'Prometheus' }, { ts: '07:00', severity: 'INFO', category: 'Compliance', message: 'Monthly fairness report auto-generated', source: 'AIF360' }, { ts: '02:30', severity: 'CRITICAL', category: 'Security', message: 'Adversarial attack detected from 203.0.113.42', source: 'ART' }];
  constructor(private m: MockDataService) { }
  ngOnInit() { const notifs = this.m.getNotifications(); this.all = notifs; this.updateCounts(); this.filterTypes = [{ value: '', icon: '📋', label: 'All', count: this.all.length }, { value: 'loan', icon: '💰', label: 'Loan', count: this.all.filter(n => n.type === 'loan').length }, { value: 'alert', icon: '🔴', label: 'Alert', count: this.all.filter(n => n.type === 'alert').length }, { value: 'model', icon: '🤖', label: 'Model', count: this.all.filter(n => n.type === 'model').length }, { value: 'system', icon: '⚙️', label: 'System', count: this.all.filter(n => n.type === 'system').length }, { value: 'compliance', icon: '📜', label: 'Compliance', count: this.all.filter(n => n.type === 'compliance').length }]; }
  updateCounts() { this.unreadCount = this.all.filter(n => !n.read).length; this.actionCount = this.all.filter(n => n.actionRequired).length; this.todayCount = this.all.length; }
  markAllRead() { this.all.forEach(n => n.read = true); this.updateCounts(); }
  getFiltered() { let list = this.all; if (this.tab === 'unread') list = list.filter(n => !n.read); if (this.tab === 'action') list = list.filter(n => n.actionRequired); if (this.typeFilter) list = list.filter(n => n.type === this.typeFilter); return list; }
  getTypeIcon(t: string) { return { loan: 'fas fa-file-invoice-dollar', alert: 'fas fa-exclamation-triangle', model: 'fas fa-robot', system: 'fas fa-cog', compliance: 'fas fa-gavel' }[t] || 'fas fa-bell'; }
  getTypeColor(t: string) { return { loan: '#2563EB', alert: '#DC2626', model: '#7C3AED', system: '#6B7280', compliance: '#059669' }[t] || '#6B7280'; }
}
