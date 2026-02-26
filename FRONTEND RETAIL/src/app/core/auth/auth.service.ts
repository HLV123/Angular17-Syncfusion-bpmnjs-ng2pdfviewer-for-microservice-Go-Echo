import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/data.models';

// Mock users for local development
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'U001', username: 'analyst01', password: '123456', fullName: 'Nguyễn Văn An',
    email: 'an.nv@retailbank.vn', role: 'CREDIT_ANALYST', department: 'Phòng Thẩm định',
    phone: '0912345678', isActive: true, lastLogin: new Date()
  },
  {
    id: 'U002', username: 'officer01', password: '123456', fullName: 'Trần Thị Bình',
    email: 'binh.tt@retailbank.vn', role: 'CREDIT_OFFICER', department: 'Phòng Tín dụng',
    phone: '0923456789', isActive: true, lastLogin: new Date()
  },
  {
    id: 'U003', username: 'manager01', password: '123456', fullName: 'Lê Minh Cường',
    email: 'cuong.lm@retailbank.vn', role: 'CREDIT_MANAGER', department: 'Ban Tín dụng',
    phone: '0934567890', isActive: true, lastLogin: new Date()
  },
  {
    id: 'U004', username: 'risk01', password: '123456', fullName: 'Phạm Hồng Dung',
    email: 'dung.ph@retailbank.vn', role: 'RISK_MANAGER', department: 'Phòng Quản lý Rủi ro',
    phone: '0945678901', isActive: true, lastLogin: new Date()
  },
  {
    id: 'U005', username: 'ds01', password: '123456', fullName: 'Hoàng Đức Em',
    email: 'em.hd@retailbank.vn', role: 'DATA_SCIENTIST', department: 'Phòng AI & Data',
    phone: '0956789012', isActive: true, lastLogin: new Date()
  },
  {
    id: 'U006', username: 'compliance01', password: '123456', fullName: 'Vũ Thị Phương',
    email: 'phuong.vt@retailbank.vn', role: 'COMPLIANCE_OFFICER', department: 'Phòng Tuân thủ',
    phone: '0967890123', isActive: true, lastLogin: new Date()
  },
  {
    id: 'U007', username: 'admin', password: 'admin', fullName: 'Trần Minh Anh',
    email: 'anh.tm@retailbank.vn', role: 'SYSTEM_ADMIN', department: 'Phòng CNTT',
    phone: '0978901234', isActive: true, lastLogin: new Date()
  },
  {
    id: 'U008', username: 'cs01', password: '123456', fullName: 'Đỗ Thanh Giang',
    email: 'giang.dt@retailbank.vn', role: 'CUSTOMER_SERVICE', department: 'Phòng DVKH',
    phone: '0989012345', isActive: true, lastLogin: new Date()
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  user = this.currentUser.asReadonly();
  isAuthenticated = computed(() => !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role);

  constructor(private router: Router) {
    const saved = localStorage.getItem('cdss_user');
    if (saved) {
      try {
        this.currentUser.set(JSON.parse(saved));
        this.token.set(localStorage.getItem('cdss_token'));
      } catch { }
    }
  }

  login(username: string, password: string): { success: boolean; message: string } {
    const found = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (!found) {
      return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu' };
    }
    if (!found.isActive) {
      return { success: false, message: 'Tài khoản đã bị khóa' };
    }
    const { password: _, ...user } = found;
    this.currentUser.set(user);
    this.token.set('mock-jwt-token-' + user.id);
    localStorage.setItem('cdss_user', JSON.stringify(user));
    localStorage.setItem('cdss_token', 'mock-jwt-token-' + user.id);
    return { success: true, message: 'Đăng nhập thành công' };
  }

  logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    localStorage.removeItem('cdss_user');
    localStorage.removeItem('cdss_token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.token();
  }

  hasRole(roles: UserRole[]): boolean {
    const r = this.currentUser()?.role;
    return r ? roles.includes(r) : false;
  }

  getAllUsers(): User[] {
    return MOCK_USERS.map(({ password, ...u }) => u);
  }

  getRoleLabel(role: UserRole): string {
    const map: Record<UserRole, string> = {
      'CREDIT_ANALYST': 'Chuyên viên Thẩm định',
      'CREDIT_OFFICER': 'Cán bộ Tín dụng',
      'CREDIT_MANAGER': 'Trưởng phòng Tín dụng',
      'RISK_MANAGER': 'Quản lý Rủi ro',
      'DATA_SCIENTIST': 'Data Scientist',
      'COMPLIANCE_OFFICER': 'Chuyên viên Tuân thủ',
      'SYSTEM_ADMIN': 'Quản trị Hệ thống',
      'CUSTOMER_SERVICE': 'Dịch vụ Khách hàng'
    };
    return map[role] || role;
  }
}
