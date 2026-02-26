import { Component, OnInit, signal } from '@angular/core'; import { CommonModule } from '@angular/common'; import { ActivatedRoute, RouterModule } from '@angular/router'; import { FormsModule } from '@angular/forms'; import { MockDataService } from '../../core/services/mock-data.service'; import { LoanApplication } from '../../core/models/data.models';
import { NgxEchartsDirective } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';
@Component({
  selector: 'app-scoring-result', standalone: true, imports: [CommonModule, RouterModule, FormsModule, NgxEchartsDirective],
  template: `<div class="page-container">@if(loan){
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px"><a routerLink="/ai-scoring" class="btn btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></a><div style="flex:1"><h1 class="page-title">Scoring: {{loan.id}}</h1><p class="page-subtitle" style="margin:0">{{loan.customerName}} · Ensemble gRPC + REST Pipeline</p></div></div>
    @if(loan.aiScore){
    <div class="row-flex">
      <div class="card col-8">
        <div class="card-header"><h3><i class="fas fa-chart-line"></i> Kết quả Scoring Pipeline</h3><span class="badge badge-tech">Model {{loan.aiScore.modelVersion}}</span></div>
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;flex-wrap:wrap">
          <div style="text-align:center;min-width:140px"><svg viewBox="0 0 120 120" style="width:140px"><circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" stroke-width="10"/><circle cx="60" cy="60" r="52" fill="none" stroke="#2563EB" stroke-width="10" stroke-dasharray="326.73" [attr.stroke-dashoffset]="326.73*(1-loan.aiScore.totalScore/1000)" stroke-linecap="round" transform="rotate(-90 60 60)"/></svg><div style="margin-top:-85px;margin-bottom:45px"><div style="font-size:2.5rem;font-weight:800;color:var(--brand-accent)">{{loan.aiScore.totalScore}}</div><span class="badge" [class]="loan.aiScore.rating==='EXCELLENT'||loan.aiScore.rating==='GOOD'?'badge-success':'badge-warning'">{{loan.aiScore.rating}}</span></div></div>
          <div style="flex:1;min-width:200px">@for(d of loan.aiScore.dimensions;track d.name){<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="width:100px;font-size:.85rem">{{d.name}}</span><div class="progress-bar" style="flex:1;height:8px"><div class="progress-fill" [class]="d.score>0.6?'fill-primary':'fill-warning'" [style.width.%]="d.score*100"></div></div><span style="width:35px;text-align:right;font-weight:700;font-size:.8rem">{{(d.score*100).toFixed(0)}}%</span></div>}</div>
          <div style="width:250px;height:220px;"><div echarts [options]="radarOptions" style="height:100%"></div></div>
        </div>
        <h4 style="margin:20px 0 12px">Component Scores (AI001)</h4>
        @for(c of loan.aiScore.components;track c.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:14px;background:var(--bg-tertiary);border-radius:10px;margin-bottom:8px"><div style="min-width:160px"><strong>{{c.name}}</strong><br><small style="color:var(--text-tertiary)">{{c.source}}</small></div><span class="badge" [class]="c.protocol==='gRPC'?'badge-tech':'badge-info'" style="min-width:80px;justify-content:center">{{c.protocol}}</span><div style="text-align:center;min-width:60px"><span style="font-size:1.3rem;font-weight:800">{{c.score}}</span></div><div style="text-align:right;min-width:70px"><span style="font-family:var(--font-mono);font-size:.85rem">{{c.latency}}ms</span></div><span class="badge badge-success" style="min-width:70px;justify-content:center">{{c.status}}</span></div>}
        <h4 style="margin:20px 0 12px">A/B Model Testing (AI003)</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div style="padding:14px;background:#ECFDF5;border:2px solid #059669;border-radius:10px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><strong>Champion: XGBoost v3.2</strong><span class="badge badge-success">PRODUCTION</span></div><div style="font-size:.85rem">AUC: <strong>0.952</strong> · PSI: 0.08 · Latency: 85ms<br>Traffic: 90% · Predictions: 12,450</div></div>
          <div style="padding:14px;background:#EFF6FF;border:2px solid #2563EB;border-radius:10px"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><strong>Challenger: LightGBM v2.1</strong><span class="badge badge-info">SHADOW</span></div><div style="font-size:.85rem">AUC: <strong>0.948</strong> · PSI: 0.06 · Latency: 52ms<br>Traffic: 10% · Predictions: 1,383</div></div>
        </div>
      </div>
      <div class="card col-4">
        <h3 style="margin-bottom:16px"><i class="fas fa-lightbulb" style="color:var(--brand-accent);margin-right:8px"></i>XAI Explanation (AIX360)</h3>
        <div style="margin-bottom:16px"><strong>Khuyến nghị AI:</strong><br><span class="badge" [class]="loan.aiScore.recommendation==='APPROVE'?'badge-success':loan.aiScore.recommendation==='CONDITIONAL'?'badge-warning':'badge-danger'" style="font-size:1rem;padding:8px 20px;margin-top:6px">{{loan.aiScore.recommendation}}</span></div>
        <h4 style="margin-bottom:8px;color:var(--brand-success)"><i class="fas fa-thumbs-up" style="margin-right:6px"></i>Yếu tố thuận lợi</h4>
        <div class="alert-box alert-success"><i class="fas fa-plus-circle" style="color:var(--brand-success)"></i><div><strong>Lịch sử thanh toán tốt</strong><br><small>SHAP: +0.43 · 36 tháng liên tục</small></div></div>
        <div class="alert-box alert-success"><i class="fas fa-plus-circle" style="color:var(--brand-success)"></i><div><strong>Thu nhập ổn định</strong><br><small>SHAP: +0.27 · 15.8M/tháng</small></div></div>
        <h4 style="margin:16px 0 8px;color:var(--brand-danger)"><i class="fas fa-thumbs-down" style="margin-right:6px"></i>Yếu tố bất lợi</h4>
        <div class="alert-box alert-danger"><i class="fas fa-minus-circle" style="color:var(--brand-danger)"></i><div><strong>Nợ hiện tại cao</strong><br><small>SHAP: -0.19 · 180M/500M hạn mức</small></div></div>
        <div class="alert-box alert-danger"><i class="fas fa-minus-circle" style="color:var(--brand-danger)"></i><div><strong>DTI gần ngưỡng</strong><br><small>SHAP: -0.14 · DTI 35%/40%</small></div></div>
        <div style="margin-top:20px;padding:16px;background:#FEF3C7;border-radius:12px;font-size:.85rem"><i class="fas fa-lightbulb" style="color:var(--brand-warning);margin-right:8px"></i><strong>Counterfactual (XAI003):</strong><br>• Tăng thu nhập thêm 2.2M → 760+<br>• Hoặc giảm khoản vay xuống 300M<br>• Hoặc kéo dài kỳ hạn 48 tháng</div>
        <button class="btn btn-primary" style="width:100%;margin-top:16px" (click)="showOverride.set(true)"><i class="fas fa-user-edit"></i> Override AI (AI004)</button>
        <button class="btn btn-secondary" style="width:100%;margin-top:8px" [routerLink]="'/loans/'+loan.id"><i class="fas fa-file-alt"></i> Xem hồ sơ vay</button>
      </div>
    </div>
    }@else{<div class="card" style="text-align:center;padding:50px"><i class="fas fa-robot" style="font-size:3rem;color:var(--text-tertiary);margin-bottom:12px;display:block"></i><h3>Chưa có kết quả scoring</h3><p style="color:var(--text-tertiary)">Hồ sơ này đang chờ xử lý</p><button class="btn btn-primary" style="margin-top:16px"><i class="fas fa-play"></i> Chạy Scoring Pipeline</button></div>}

    @if(showOverride()){<div class="modal-overlay" (click)="showOverride.set(false)"><div class="modal-content" style="max-width:600px" (click)="$event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;margin-bottom:20px"><h2><i class="fas fa-user-edit" style="margin-right:8px;color:var(--brand-accent)"></i>Override AI Decision (AI004)</h2><button class="btn btn-sm btn-secondary" (click)="showOverride.set(false)"><i class="fas fa-times"></i></button></div>
      <div style="display:flex;gap:16px;margin-bottom:20px">
        <div style="flex:1;padding:14px;background:var(--bg-tertiary);border-radius:10px;text-align:center"><small style="color:var(--text-tertiary)">AI Score</small><br><strong style="font-size:1.8rem;color:var(--brand-accent)">{{loan.aiScore?.totalScore}}</strong></div>
        <div style="flex:1;padding:14px;background:var(--bg-tertiary);border-radius:10px;text-align:center"><small style="color:var(--text-tertiary)">AI Recommend</small><br><span class="badge" [class]="loan.aiScore?.recommendation==='APPROVE'?'badge-success':'badge-warning'" style="font-size:1rem;padding:6px 16px;margin-top:6px">{{loan.aiScore?.recommendation}}</span></div>
      </div>
      <div class="form-group"><label>Quyết định Override *</label><select [(ngModel)]="overrideDecision" style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px"><option value="">-- Chọn quyết định --</option><option value="APPROVE">✅ PHÊ DUYỆT (Override lên trên AI)</option><option value="CONDITIONAL">⚠️ PHÊ DUYỆT CÓ ĐIỀU KIỆN</option><option value="REJECT">❌ TỪ CHỐI (Override xuống dưới AI)</option><option value="REVIEW">📋 CHUYỂN THẨM ĐỊNH CẤP TRÊN</option></select></div>
      <div class="form-group"><label>Lý do Override (bắt buộc) *</label><textarea rows="3" [(ngModel)]="overrideReason" placeholder="VD: Khách hàng VIP, có lịch sử quan hệ tốt 10+ năm. AI chưa phản ánh yếu tố này trong scoring model." style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px"></textarea></div>
      <div class="form-group"><label>Ghi chú (tùy chọn)</label><input type="text" placeholder="VD: Yêu cầu bổ sung bảo lãnh" style="width:100%;padding:8px 12px;border:1px solid var(--border-light);border-radius:8px"></div>
      <div style="padding:12px;background:#FEF3C7;border-radius:8px;font-size:.82rem;margin-bottom:16px"><i class="fas fa-exclamation-triangle" style="color:var(--brand-warning);margin-right:6px"></i><strong>Lưu ý:</strong> Override sẽ được ghi nhận vào Audit Trail. Tỷ lệ override sẽ được theo dõi bởi Compliance.</div>
      <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" (click)="showOverride.set(false)">Hủy</button><button class="btn btn-primary" (click)="showOverride.set(false)" [disabled]="!overrideDecision||!overrideReason"><i class="fas fa-check"></i> Xác nhận Override</button></div>
    </div></div>}
  }</div>`, styles: ['']
})
export class ScoringResultComponent implements OnInit {
  loan: LoanApplication | null = null;
  radarOptions: EChartsOption = {};
  showOverride = signal(false);
  overrideDecision = ''; overrideReason = '';
  constructor(private route: ActivatedRoute, private m: MockDataService) { }
  ngOnInit() { const id = this.route.snapshot.paramMap.get('loanId'); this.loan = this.m.getLoans().find(l => l.id === id) || null; if (this.loan?.aiScore) { this.initChart(); } }
  initChart() {
    this.radarOptions = { radar: { indicator: this.loan!.aiScore.dimensions.map(d => ({ name: d.name, max: 1 })), radius: '65%', splitNumber: 4, axisName: { color: 'var(--text-secondary)', fontSize: 10 } }, series: [{ type: 'radar', data: [{ value: this.loan!.aiScore.dimensions.map(d => d.score), name: 'Điểm thành phần' }], itemStyle: { color: '#2563EB' }, areaStyle: { color: 'rgba(37, 99, 235, 0.2)' } }] };
  }
}
