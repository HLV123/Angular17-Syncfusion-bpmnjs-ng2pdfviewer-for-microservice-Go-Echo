import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { loadNotifications, selectUnreadCount } from '../../store/notifications/notifications.reducer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  template: `
    <header class="top-header">
      <div class="header-left">
        <button class="menu-toggle" (click)="sidebarCollapsed.set(!sidebarCollapsed())">
          <i class="fas fa-bars"></i>
        </button>
        <div class="logo-area" routerLink="/dashboard">
          <img src="assets/images/logo.png" alt="Logo" class="header-logo">
          <div class="logo-text" [class.hidden]="sidebarCollapsed()">
            <span class="brand-name">RETAIL PLATFORM</span>
            <span class="brand-sub">CDSS · v1.0</span>
          </div>
        </div>
      </div>
      <div class="header-center">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Tìm kiếm hồ sơ, khách hàng, model..." [(ngModel)]="searchQuery">
        </div>
      </div>
      <div class="header-right">
        <div class="header-protocols">
          <span class="proto-badge grpc"><i class="fas fa-bolt"></i> gRPC</span>
          <span class="proto-badge ws"><i class="fas fa-plug"></i> WS</span>
          <span class="proto-badge rest"><i class="fas fa-globe"></i> REST</span>
        </div>
        <button class="hdr-icon" (click)="toggleLang()" [title]="'Language: ' + currentLang">
          <span style="font-size:.75rem;font-weight:700">{{ currentLang === 'vi' ? 'VI' : 'EN' }}</span>
        </button>
        <button class="hdr-icon" routerLink="/notifications">
          <i class="fas fa-bell"></i>
          @if (unreadCount() > 0) { <span class="notif-dot">{{ unreadCount() }}</span> }
        </button>
        <div class="user-menu" (click)="toggleMenu($event)">
          <div class="avatar-sm">{{ getInitials() }}</div>
          <div class="uinfo">
            <span class="uname">{{ auth.user()?.fullName }}</span>
            <span class="urole">{{ auth.getRoleLabel(auth.user()?.role!) }}</span>
          </div>
          <i class="fas fa-chevron-down chevron"></i>
          @if (showMenu()) {
            <div class="ddmenu" (click)="$event.stopPropagation()">
              <div class="dd-head"><div class="avatar-sm lg">{{ getInitials() }}</div><div><strong>{{ auth.user()?.fullName }}</strong><br><small>{{ auth.user()?.email }}</small></div></div>
              <hr>
              <button (click)="showMenu.set(false)"><i class="fas fa-user-circle"></i> Hồ sơ cá nhân</button>
              <button (click)="showMenu.set(false)"><i class="fas fa-cog"></i> Cài đặt</button>
              <hr>
              <button class="danger" (click)="logout()"><i class="fas fa-sign-out-alt"></i> Đăng xuất</button>
            </div>
          }
        </div>
      </div>
    </header>
    <div class="main-wrap">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <nav>
          @for (item of filteredNavItems(); track $index) {
            @if (item.route === '---') {
              <div class="nav-sep"></div>
            } @else {
              <a class="nav-link" [routerLink]="item.route" routerLinkActive="active"
                 [routerLinkActiveOptions]="{exact: item.route==='/dashboard'}" [title]="item.label">
                <i [class]="item.icon"></i>
                @if (!sidebarCollapsed()) { <span>{{ item.label }}</span> }
              </a>
            }
          }
        </nav>
        @if (!sidebarCollapsed()) {
          <div class="sidebar-bottom">
            <div class="proto-info"><i class="fas fa-microchip"></i> gRPC-Web · STOMP · REST</div>
          </div>
        }
      </aside>
      <main class="content-area"><router-outlet></router-outlet></main>
    </div>
  `,
  styles: [`
    :host{display:flex;flex-direction:column;min-height:100vh}
    .top-header{height:var(--header-height);background:#fff;border-bottom:1px solid var(--border-light);display:flex;align-items:center;padding:0 20px;gap:16px;position:sticky;top:0;z-index:100;box-shadow:0 1px 3px rgba(0,0,0,.04)}
    .header-left{display:flex;align-items:center;gap:10px}
    .menu-toggle{width:36px;height:36px;background:none;border:none;color:var(--text-secondary);font-size:1.1rem;cursor:pointer;border-radius:8px;display:flex;align-items:center;justify-content:center;&:hover{background:var(--bg-hover)}}
    .logo-area{display:flex;align-items:center;gap:10px;cursor:pointer;text-decoration:none}
    .header-logo{width:38px;height:38px;border-radius:10px}
    .logo-text{display:flex;flex-direction:column;.brand-name{font-weight:800;font-size:.95rem;color:var(--brand-primary);letter-spacing:-.01em}.brand-sub{font-size:.65rem;color:var(--text-tertiary);font-weight:500}&.hidden{display:none}}
    .header-center{flex:1;max-width:460px;margin:0 auto}
    .search-box{display:flex;align-items:center;gap:10px;background:var(--bg-tertiary);border:1px solid var(--border-light);border-radius:10px;padding:0 14px;transition:.2s;&:focus-within{border-color:var(--brand-accent);box-shadow:0 0 0 3px rgba(37,99,235,.08)}i{color:var(--text-tertiary);font-size:.85rem}input{border:none;background:none;padding:10px 0;font-size:.85rem;width:100%;color:var(--text-primary);font-family:var(--font-main);&::placeholder{color:var(--text-tertiary)}&:focus{outline:none}}}
    .header-right{display:flex;align-items:center;gap:14px}
    .header-protocols{display:flex;gap:5px}
    .proto-badge{padding:3px 8px;border-radius:6px;font-size:.63rem;font-weight:600;display:flex;align-items:center;gap:3px;i{font-size:.58rem}&.grpc{background:#EDE9FE;color:#7C3AED}&.ws{background:#ECFDF5;color:#059669}&.rest{background:#FFF7ED;color:#D97706}}
    .hdr-icon{position:relative;width:36px;height:36px;background:none;border:none;border-radius:10px;color:var(--text-secondary);font-size:1.05rem;cursor:pointer;display:flex;align-items:center;justify-content:center;&:hover{background:var(--bg-hover)}.notif-dot{position:absolute;top:2px;right:2px;background:var(--brand-danger);color:#fff;font-size:.58rem;font-weight:700;min-width:16px;height:16px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:2px solid #fff}}
    .user-menu{display:flex;align-items:center;gap:10px;cursor:pointer;padding:4px 8px;border-radius:10px;position:relative;&:hover{background:var(--bg-hover)}.chevron{font-size:.65rem;color:var(--text-tertiary)}}
    .avatar-sm{width:34px;height:34px;background:var(--brand-primary);color:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;flex-shrink:0;&.lg{width:42px;height:42px;font-size:.95rem}}
    .uinfo{display:flex;flex-direction:column;.uname{font-weight:600;font-size:.82rem;color:var(--text-primary)}.urole{font-size:.68rem;color:var(--text-tertiary)}}
    .ddmenu{position:absolute;top:100%;right:0;margin-top:8px;background:#fff;border:1px solid var(--border-light);border-radius:12px;box-shadow:var(--shadow-xl);min-width:250px;z-index:200;padding:8px;animation:fadeIn .15s ease;.dd-head{display:flex;align-items:center;gap:12px;padding:10px;strong{font-size:.9rem}small{color:var(--text-tertiary);font-size:.75rem}}hr{border:none;height:1px;background:var(--border-light);margin:4px 0}button{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;background:none;border:none;border-radius:8px;cursor:pointer;font-size:.84rem;color:var(--text-secondary);font-family:var(--font-main);&:hover{background:var(--bg-hover)}i{width:18px;text-align:center}&.danger{color:var(--brand-danger);&:hover{background:#FEF2F2}}}}
    .main-wrap{display:flex;flex:1}
    .sidebar{width:var(--sidebar-width);background:#fff;border-right:1px solid var(--border-light);height:calc(100vh - var(--header-height));position:sticky;top:var(--header-height);display:flex;flex-direction:column;transition:width .25s ease;overflow-y:auto;overflow-x:hidden;&.collapsed{width:var(--sidebar-collapsed-width); .nav-link span { display: none; } }}
    nav{flex:1;padding:10px 8px}
    .nav-link{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:10px;color:var(--text-secondary);font-weight:500;font-size:.86rem;margin-bottom:2px;transition:.15s;text-decoration:none;white-space:nowrap;i{width:20px;text-align:center;font-size:.95rem;color:var(--text-tertiary);flex-shrink:0}&:hover{background:var(--bg-hover);color:var(--brand-accent);i{color:var(--brand-accent)}}&.active{background:#EEF2FF;color:var(--brand-accent);font-weight:600;i{color:var(--brand-accent)}}}
    .nav-sep{height:1px;background:var(--border-light);margin:10px 14px}
    .sidebar-bottom{padding:12px 14px;border-top:1px solid var(--border-light)}
    .proto-info{font-size:.7rem;color:var(--text-tertiary);padding:10px;background:var(--bg-tertiary);border-radius:10px;i{margin-right:6px}}
    .content-area{flex:1;overflow-x:auto;min-height:calc(100vh - var(--header-height));background:var(--bg-primary)}
    @media(max-width:768px){.sidebar{position:fixed;z-index:90;left:0;top:var(--header-height);&.collapsed{width:0;border:none}}.header-protocols,.uinfo,.logo-text{display:none}.header-center{max-width:200px}}
  `]
})
export class MainLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  showMenu = signal(false);
  searchQuery = '';
  currentLang = 'vi';
  unreadCount = signal(0);

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.showMenu.set(!this.showMenu());
  }

  navItems = [
    { label: 'Dashboard tổng quan', icon: 'fas fa-tachometer-alt', route: '/dashboard' },
    { label: 'Hồ sơ khách hàng', icon: 'fas fa-address-card', route: '/customers', roles: ['CREDIT_ANALYST', 'CREDIT_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN', 'CUSTOMER_SERVICE'] },
    { label: 'Tiếp nhận đơn vay', icon: 'fas fa-file-signature', route: '/loans', roles: ['CREDIT_ANALYST', 'CREDIT_OFFICER', 'CREDIT_MANAGER', 'SYSTEM_ADMIN'] },
    { label: 'AI Scoring', icon: 'fas fa-robot', route: '/ai-scoring', roles: ['CREDIT_ANALYST', 'CREDIT_MANAGER', 'RISK_MANAGER', 'DATA_SCIENTIST', 'SYSTEM_ADMIN'] },
    { label: 'AutoML & Training', icon: 'fas fa-flask', route: '/automl', roles: ['DATA_SCIENTIST', 'SYSTEM_ADMIN'] },
    { label: 'Model Registry', icon: 'fas fa-cubes', route: '/model-registry', roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'SYSTEM_ADMIN'] },
    { label: '---', icon: '', route: '---' },
    { label: 'Fairness & Bias', icon: 'fas fa-balance-scale', route: '/fairness', roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN'] },
    { label: 'AI Explainability', icon: 'fas fa-lightbulb', route: '/explainability', roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'CREDIT_MANAGER', 'COMPLIANCE_OFFICER', 'SYSTEM_ADMIN'] },
    { label: 'Adversarial Defense', icon: 'fas fa-shield-alt', route: '/adversarial', roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'SYSTEM_ADMIN'] },
    { label: '---', icon: '', route: '---' },
    { label: 'Giám sát hệ thống', icon: 'fas fa-chart-area', route: '/monitoring', roles: ['DATA_SCIENTIST', 'RISK_MANAGER', 'SYSTEM_ADMIN'] },
    { label: 'Phê duyệt / Workflow', icon: 'fas fa-tasks', route: '/workflow', roles: ['CREDIT_MANAGER', 'RISK_MANAGER', 'SYSTEM_ADMIN'] },
    { label: 'Danh mục tín dụng', icon: 'fas fa-chart-pie', route: '/portfolio', roles: ['CREDIT_MANAGER', 'RISK_MANAGER', 'SYSTEM_ADMIN'] },
    { label: 'Báo cáo & Tuân thủ', icon: 'fas fa-file-contract', route: '/compliance', roles: ['COMPLIANCE_OFFICER', 'RISK_MANAGER', 'SYSTEM_ADMIN'] },
    { label: 'Cảnh báo & EWS', icon: 'fas fa-exclamation-triangle', route: '/notifications' },
    { label: '---', icon: '', route: '---' },
    { label: 'Quản trị hệ thống', icon: 'fas fa-sliders-h', route: '/admin', roles: ['SYSTEM_ADMIN'] },
  ];

  filteredNavItems() {
    let result = [];
    let lastWasSeparator = false;
    for (const item of this.navItems) {
      if (item.route === '---') {
        if (!lastWasSeparator && result.length > 0) {
          result.push(item);
          lastWasSeparator = true;
        }
      } else {
        if (!item.roles || this.auth.hasRole(item.roles as any)) {
          result.push(item);
          lastWasSeparator = false;
        }
      }
    }
    if (result.length > 0 && result[result.length - 1].route === '---') {
      result.pop();
    }
    return result;
  }

  constructor(
    public auth: AuthService,
    private store: Store,
    private mockData: MockDataService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('vi');
    this.translate.use('vi');
  }

  ngOnInit() {
    const notifs = this.mockData.getNotifications();
    this.store.dispatch(loadNotifications({ notifications: notifs }));
    this.unreadCount.set(notifs.filter(n => !n.read).length);

    // Close menu when clicking outside
    document.addEventListener('click', () => {
      if (this.showMenu()) this.showMenu.set(false);
    });
  }

  getInitials(): string {
    const name = this.auth.user()?.fullName || '';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.showMenu.set(false);
    this.auth.logout();
  }

  toggleLang() {
    this.currentLang = this.currentLang === 'vi' ? 'en' : 'vi';
    this.translate.use(this.currentLang);
  }
}
