import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="bg-grid"></div>
        <div class="bg-glow glow-1"></div>
        <div class="bg-glow glow-2"></div>
      </div>

      <div class="login-container">
        <div class="login-left">
          <div class="brand-section">
            <img src="assets/images/logo.png" alt="Retail Platform" class="brand-logo">
            <h1>Retail Platform</h1>
            <p class="brand-tagline">Smart Credit Decision Support System</p>
          </div>
          <div class="features-list">
            <div class="feature-item">
              <i class="fas fa-robot"></i>
              <div>
                <strong>AI-Powered Scoring</strong>
                <span>Chấm điểm tín dụng đa mô hình với Seldon, Kubeflow, SageMaker</span>
              </div>
            </div>
            <div class="feature-item">
              <i class="fas fa-balance-scale"></i>
              <div>
                <strong>Fairness & Bias Detection</strong>
                <span>Đảm bảo công bằng với AI Fairness 360</span>
              </div>
            </div>
            <div class="feature-item">
              <i class="fas fa-shield-alt"></i>
              <div>
                <strong>Adversarial Robustness</strong>
                <span>Bảo vệ model khỏi tấn công với ART</span>
              </div>
            </div>
            <div class="feature-item">
              <i class="fas fa-chart-line"></i>
              <div>
                <strong>Real-time Monitoring</strong>
                <span>Giám sát hệ thống 24/7 với Prometheus & Grafana</span>
              </div>
            </div>
          </div>
          <div class="tech-stack">
            <span>Angular 17+</span><span>NgRx</span><span>gRPC-Web</span><span>STOMP</span>
            <span>Go + Gin</span><span>Kafka</span><span>PostgreSQL</span><span>Kubernetes</span>
          </div>
        </div>

        <div class="login-right">
          <div class="login-form-wrapper">
            <h2>Đăng nhập hệ thống</h2>
            <p class="login-desc">Sử dụng tài khoản nội bộ để truy cập CDSS</p>

            @if (error()) {
              <div class="error-banner">
                <i class="fas fa-exclamation-circle"></i>
                {{ error() }}
              </div>
            }

            <form (ngSubmit)="onLogin()" class="login-form">
              <div class="input-group">
                <label>Tên đăng nhập</label>
                <div class="input-wrapper">
                  <i class="fas fa-user"></i>
                  <input type="text" [(ngModel)]="username" name="username"
                         placeholder="Nhập username" autocomplete="username" required>
                </div>
              </div>
              <div class="input-group">
                <label>Mật khẩu</label>
                <div class="input-wrapper">
                  <i class="fas fa-lock"></i>
                  <input [type]="showPassword() ? 'text' : 'password'"
                         [(ngModel)]="password" name="password"
                         placeholder="Nhập mật khẩu" autocomplete="current-password" required>
                  <button type="button" class="toggle-pw" (click)="showPassword.set(!showPassword())">
                    <i [class]="showPassword() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
              </div>
              <button type="submit" class="btn-login" [disabled]="loading()">
                @if (loading()) {
                  <i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...
                } @else {
                  <i class="fas fa-sign-in-alt"></i> Đăng nhập
                }
              </button>
            </form>

            <div class="demo-accounts">
              <h4><i class="fas fa-info-circle"></i> Tài khoản demo</h4>
              <div class="account-grid">
                @for (acc of demoAccounts; track acc.username) {
                  <button class="account-chip" (click)="fillDemo(acc.username)">
                    <span class="chip-role">{{ acc.role }}</span>
                    <span class="chip-user">{{ acc.username }}</span>
                  </button>
                }
              </div>
              <p class="pw-hint"><i class="fas fa-key"></i> Mật khẩu chung: <code>123456</code> (admin: <code>admin</code>)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background: #070B14;
    }
    .login-bg {
      position: absolute; inset: 0;
      .bg-grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(37,99,235,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37,99,235,0.03) 1px, transparent 1px);
        background-size: 60px 60px;
      }
      .bg-glow {
        position: absolute; border-radius: 50%; filter: blur(120px);
      }
      .glow-1 { width: 600px; height: 600px; top: -200px; right: -100px; background: rgba(37,99,235,0.12); }
      .glow-2 { width: 500px; height: 500px; bottom: -150px; left: -100px; background: rgba(5,150,105,0.08); }
    }

    .login-container {
      position: relative; z-index: 1;
      display: flex;
      width: 1100px;
      max-width: 95vw;
      min-height: 640px;
      background: rgba(15,23,42,0.8);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 40px 80px rgba(0,0,0,0.5);
      overflow: hidden;
      animation: slideUp 0.6s ease;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .login-left {
      flex: 1;
      padding: 48px 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-right: 1px solid rgba(255,255,255,0.06);
    }

    .brand-section {
      margin-bottom: 36px;
      .brand-logo {
        width: 72px; height: 72px;
        border-radius: 18px;
        margin-bottom: 16px;
        box-shadow: 0 8px 24px rgba(37,99,235,0.3);
      }
      h1 {
        font-size: 1.8rem;
        font-weight: 800;
        color: #F8FAFC;
        letter-spacing: -0.02em;
      }
      .brand-tagline {
        color: #64748B;
        font-size: 0.92rem;
        margin-top: 4px;
      }
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 32px;
    }
    .feature-item {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      i {
        width: 36px; height: 36px;
        background: rgba(37,99,235,0.15);
        color: #60A5FA;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        flex-shrink: 0;
      }
      strong { color: #E2E8F0; font-size: 0.88rem; display: block; }
      span { color: #64748B; font-size: 0.78rem; }
    }

    .tech-stack {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      span {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        color: #94A3B8;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.72rem;
        font-weight: 500;
      }
    }

    .login-right {
      flex: 0 0 420px;
      padding: 48px 40px;
      display: flex;
      align-items: center;
      background: rgba(30,41,59,0.3);
    }

    .login-form-wrapper {
      width: 100%;
      h2 { color: #F1F5F9; font-size: 1.5rem; font-weight: 700; margin-bottom: 6px; }
      .login-desc { color: #64748B; font-size: 0.85rem; margin-bottom: 28px; }
    }

    .error-banner {
      background: rgba(220,38,38,0.12);
      border: 1px solid rgba(220,38,38,0.3);
      color: #FCA5A5;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 0.85rem;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      i { color: #F87171; }
    }

    .input-group {
      margin-bottom: 20px;
      label { color: #94A3B8; font-size: 0.82rem; font-weight: 600; margin-bottom: 6px; display: block; }
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      > i:first-child {
        position: absolute;
        left: 14px;
        color: #475569;
        font-size: 0.9rem;
      }
      input {
        width: 100%;
        padding: 12px 14px 12px 42px;
        background: rgba(15,23,42,0.6);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 10px;
        color: #F1F5F9;
        font-size: 0.92rem;
        font-family: 'Be Vietnam Pro', sans-serif;
        transition: all 0.2s;
        &::placeholder { color: #475569; }
        &:focus {
          outline: none;
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
      }
      .toggle-pw {
        position: absolute; right: 12px;
        background: none; border: none; color: #475569; cursor: pointer;
        &:hover { color: #94A3B8; }
      }
    }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: #2563EB;
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      font-family: 'Be Vietnam Pro', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      &:hover:not(:disabled) { background: #1D4ED8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.4); }
      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }

    .demo-accounts {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      h4 { color: #94A3B8; font-size: 0.82rem; margin-bottom: 12px; i { margin-right: 6px; } }
    }
    .account-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    .account-chip {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 8px 10px;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
      font-family: 'Be Vietnam Pro', sans-serif;
      &:hover { background: rgba(37,99,235,0.1); border-color: rgba(37,99,235,0.3); }
      .chip-role { display: block; color: #64748B; font-size: 0.68rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
      .chip-user { color: #E2E8F0; font-size: 0.82rem; font-weight: 500; }
    }
    .pw-hint {
      color: #475569; font-size: 0.75rem;
      code { background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: #94A3B8; font-family: 'JetBrains Mono', monospace; }
      i { margin-right: 4px; }
    }

    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { flex: 1; }
      .login-container { max-width: 440px; }
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);

  demoAccounts = [
    { username: 'analyst01', role: 'Chuyên viên' },
    { username: 'officer01', role: 'Cán bộ TD' },
    { username: 'manager01', role: 'Trưởng phòng' },
    { username: 'risk01', role: 'Risk Manager' },
    { username: 'ds01', role: 'Data Scientist' },
    { username: 'compliance01', role: 'Compliance' },
    { username: 'admin', role: 'Admin' },
    { username: 'cs01', role: 'DVKH' },
  ];

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  fillDemo(username: string) {
    this.username = username;
    this.password = username === 'admin' ? 'admin' : '123456';
    this.error.set('');
  }

  onLogin() {
    this.error.set('');
    if (!this.username || !this.password) {
      this.error.set('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    this.loading.set(true);
    setTimeout(() => {
      const result = this.auth.login(this.username, this.password);
      this.loading.set(false);
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set(result.message);
      }
    }, 600);
  }
}
