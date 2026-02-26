import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { LoanApplication } from '../../core/models/data.models';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxDropzoneModule } from 'ngx-dropzone';
@Component({
  selector: 'app-loan-detail', standalone: true, imports: [CommonModule, RouterModule, PdfViewerModule, NgxDropzoneModule],
  template: `
    <div class="page-container">@if(loan){
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <a routerLink="/loans" class="btn btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></a>
        <div style="flex:1"><h1 class="page-title">Hồ sơ {{loan.id}}</h1><p class="page-subtitle" style="margin:0">{{loan.customerName}} · {{getProduct(loan.productType)}} · {{(loan.amount/1e6)}}M VNĐ</p></div>
        <span class="status-badge" [class]="'status-'+loan.status.toLowerCase()" style="font-size:.88rem;padding:8px 18px">{{getStatus(loan.status)}}</span>
      </div>
      <div class="tab-group">
        <div class="tab-item" [class.active]="tab==='detail'" (click)="tab='detail'">Chi tiết</div>
        <div class="tab-item" [class.active]="tab==='ai'" (click)="tab='ai'">AI Scoring</div>
        <div class="tab-item" [class.active]="tab==='docs'" (click)="tab='docs'">Tài liệu (ng2-pdf-viewer)</div>
        <div class="tab-item" [class.active]="tab==='timeline'" (click)="tab='timeline'">Timeline</div>
      </div>

      @if(tab==='detail'){
      <div class="row-flex">
        <div class="card col-8">
          <h3 style="margin-bottom:20px"><i class="fas fa-info-circle" style="color:var(--brand-accent);margin-right:8px"></i>Chi tiết khoản vay</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
            <div><small style="color:var(--text-tertiary)">Số tiền vay</small><br><strong style="font-size:1.3rem;color:var(--brand-accent)">{{(loan.amount/1e6)}}M</strong></div>
            <div><small style="color:var(--text-tertiary)">Kỳ hạn</small><br><strong style="font-size:1.3rem">{{loan.term}} tháng</strong></div>
            <div><small style="color:var(--text-tertiary)">Lãi suất</small><br><strong style="font-size:1.3rem">{{loan.interestRate}}%</strong></div>
            <div><small style="color:var(--text-tertiary)">DTI</small><br><strong [style.color]="loan.dti>40?'var(--brand-danger)':'var(--brand-success)'">{{loan.dti}}%</strong></div>
            @if(loan.ltv){<div><small style="color:var(--text-tertiary)">LTV</small><br><strong>{{loan.ltv}}%</strong></div>}
            @if(loan.collateralType){<div><small style="color:var(--text-tertiary)">TSĐB</small><br><strong>{{loan.collateralType}}</strong></div>}
            <div><small style="color:var(--text-tertiary)">Mục đích</small><br><strong>{{loan.purpose}}</strong></div>
            <div><small style="color:var(--text-tertiary)">Chuyên viên</small><br><strong>{{loan.assignedAnalyst||'—'}}</strong></div>
            <div><small style="color:var(--text-tertiary)">Cán bộ TD</small><br><strong>{{loan.assignedOfficer||'—'}}</strong></div>
          </div>
          @if(loan.preScreenResult){
          <div style="margin-top:24px;padding:18px;border-radius:12px" [style.background]="loan.preScreenResult.status==='PASS'?'#ECFDF5':'#FEF3C7'">
            <h4 style="margin-bottom:10px"><i class="fas fa-filter" style="margin-right:8px"></i>Pre-screening (DV004)</h4>
            <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:.88rem">
              <span><i class="fas" [class]="loan.preScreenResult.cicCheck?'fa-check-circle':'fa-times-circle'" [style.color]="loan.preScreenResult.cicCheck?'var(--brand-success)':'var(--brand-danger)'"></i> CIC</span>
              <span><i class="fas" [class]="loan.preScreenResult.blacklistCheck?'fa-check-circle':'fa-times-circle'" [style.color]="loan.preScreenResult.blacklistCheck?'var(--brand-success)':'var(--brand-danger)'"></i> Blacklist</span>
              <span><i class="fas" [class]="loan.preScreenResult.basicConditionCheck?'fa-check-circle':'fa-times-circle'" [style.color]="loan.preScreenResult.basicConditionCheck?'var(--brand-success)':'var(--brand-danger)'"></i> Điều kiện</span>
              <span class="badge" [class]="loan.preScreenResult.status==='PASS'?'badge-success':'badge-warning'">{{loan.preScreenResult.status}}</span>
            </div>
            @for(d of loan.preScreenResult.details;track d){<div style="font-size:.82rem;margin-top:4px;color:var(--text-secondary)">· {{d}}</div>}
          </div>}
        </div>
        <div class="card col-4">
          @if(loan.status==='REVIEWING'||loan.status==='CONDITIONALLY_APPROVED'){
          <h3 style="margin-bottom:16px"><i class="fas fa-gavel" style="color:var(--brand-warning);margin-right:8px"></i>Hành động</h3>
          <button class="btn btn-success" style="width:100%;margin-bottom:8px" (click)="showApproveModal=true"><i class="fas fa-check"></i> Phê duyệt</button>
          <button class="btn btn-danger" style="width:100%;margin-bottom:8px"><i class="fas fa-times"></i> Từ chối</button>
          <button class="btn btn-secondary" style="width:100%;margin-bottom:8px"><i class="fas fa-undo"></i> Yêu cầu bổ sung</button>
          <button class="btn btn-outline" style="width:100%" [routerLink]="'/ai-scoring/'+loan.id"><i class="fas fa-robot"></i> Xem AI Score chi tiết</button>
          }@else{
          <h3 style="margin-bottom:16px">Thông tin xử lý</h3>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px"><span>Ngày tạo</span><strong style="font-size:.82rem">{{loan.createdAt|date:'dd/MM HH:mm'}}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px"><span>Cập nhật</span><strong style="font-size:.82rem">{{loan.updatedAt|date:'dd/MM HH:mm'}}</strong></div>
            @if(loan.aiScore){<div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px"><span>AI Score</span><strong [style.color]="loan.aiScore.totalScore>=700?'var(--brand-success)':'var(--brand-warning)'">{{loan.aiScore.totalScore}}/1000</strong></div>}
          </div>}
        </div>
      </div>}

      @if(tab==='docs'){
      <div class="row-flex">
        <div class="card col-8">
          <div class="card-header"><h3><i class="fas fa-file-pdf"></i> Tài liệu đã tải lên</h3><span class="badge badge-tech">ng2-pdf-viewer</span></div>
          @if(selectedPdf){<div style="background:#F1F5F9;border-radius:12px;padding:8px;margin-bottom:12px"><pdf-viewer [src]="selectedPdf" [render-text]="true" [original-size]="false" style="display:block;height:400px"></pdf-viewer></div>}
          <table class="data-table"><thead><tr><th>Tên file</th><th>Loại</th><th>Ngày tải</th><th>OCR</th><th></th></tr></thead><tbody>
            @for(d of docList;track d.name){<tr><td><strong>{{d.name}}</strong></td><td><span class="badge badge-info">{{d.type}}</span></td><td style="font-size:.82rem">{{d.uploaded}}</td><td><i class="fas" [class]="d.ocr?'fa-check-circle':'fa-times-circle'" [style.color]="d.ocr?'var(--brand-success)':'var(--text-tertiary)'"></i></td><td><button class="btn btn-sm btn-secondary" (click)="selectedPdf=d.url"><i class="fas fa-eye"></i></button></td></tr>}
          </tbody></table>
        </div>
        <div class="card col-4">
          <h3 style="margin-bottom:12px"><i class="fas fa-cloud-upload-alt" style="margin-right:8px"></i>Tải tài liệu (ngx-dropzone)</h3>
          <ngx-dropzone (change)="onFileSelect($event)" [accept]="'application/pdf,image/*'" style="min-height:160px;border:2px dashed var(--border-light);border-radius:12px">
            <ngx-dropzone-label><i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:var(--text-tertiary);display:block;margin-bottom:8px"></i>Kéo file hoặc click để chọn<br><small style="color:var(--text-tertiary)">PDF, JPG, PNG (tối đa 10MB)</small></ngx-dropzone-label>
            @for(f of uploadedFiles;track f.name){<ngx-dropzone-preview [removable]="true" (removed)="onFileRemove(f)"><ngx-dropzone-label>{{f.name}} ({{(f.size/1024).toFixed(0)}}KB)</ngx-dropzone-label></ngx-dropzone-preview>}
          </ngx-dropzone>
          @if(uploadedFiles.length>0){<button class="btn btn-primary" style="width:100%;margin-top:12px"><i class="fas fa-upload"></i> Upload {{uploadedFiles.length}} file(s)</button>}
        </div>
      </div>}

      @if(tab==='ai'){
        @if(loan.aiScore){
        <div class="row-flex">
          <div class="card col-8">
            <div class="card-header"><h3><i class="fas fa-robot"></i> AI Scoring Result</h3><span class="badge badge-tech">Ensemble gRPC+REST</span></div>
            <div style="display:flex;align-items:center;gap:30px;margin-bottom:24px">
              <div style="text-align:center;min-width:120px">
                <svg viewBox="0 0 120 120" style="width:120px;height:120px"><circle cx="60" cy="60" r="52" fill="none" stroke="#E2E8F0" stroke-width="10"/><circle cx="60" cy="60" r="52" fill="none" stroke="#2563EB" stroke-width="10" stroke-dasharray="326.73" [attr.stroke-dashoffset]="326.73*(1-loan.aiScore.totalScore/1000)" stroke-linecap="round" transform="rotate(-90 60 60)"/></svg>
                <div style="margin-top:-82px;margin-bottom:40px"><div style="font-size:2.2rem;font-weight:800;color:var(--brand-accent)">{{loan.aiScore.totalScore}}</div><small style="color:var(--text-tertiary)">/ 1000</small></div>
              </div>
              <div style="flex:1">@for(d of loan.aiScore.dimensions;track d.name){<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:110px;font-size:.82rem">{{d.name}}</span><div class="progress-bar" style="flex:1;height:8px"><div class="progress-fill" [class]="d.score>0.6?'fill-primary':'fill-warning'" [style.width.%]="d.score*100"></div></div><span style="width:35px;text-align:right;font-size:.8rem;font-weight:600">{{(d.score*100).toFixed(0)}}%</span></div>}</div>
            </div>
            <h4 style="margin-bottom:10px">Components</h4>
            @for(c of loan.aiScore.components;track c.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--bg-tertiary);border-radius:10px;margin-bottom:6px"><strong>{{c.name}}</strong><span class="badge" [class]="c.protocol==='gRPC'?'badge-tech':'badge-info'">{{c.protocol}} · {{c.source}}</span><span style="font-weight:800;font-size:1.1rem">{{c.score}}</span><small style="color:var(--text-tertiary)">{{c.latency}}ms</small><span class="badge badge-success">{{c.status}}</span></div>}
          </div>
          <div class="card col-4">
            <h3 style="margin-bottom:16px"><i class="fas fa-lightbulb" style="color:var(--brand-accent);margin-right:8px"></i>XAI</h3>
            <div style="margin-bottom:16px"><strong>Khuyến nghị:</strong> <span class="badge" [class]="loan.aiScore.recommendation==='APPROVE'?'badge-success':loan.aiScore.recommendation==='CONDITIONAL'?'badge-warning':'badge-danger'" style="padding:6px 14px">{{loan.aiScore.recommendation}}</span></div>
            <div class="alert-box alert-success"><i class="fas fa-plus-circle" style="color:var(--brand-success)"></i><div>Lịch sử thanh toán tốt <strong>(+0.43)</strong></div></div>
            <div class="alert-box alert-success"><i class="fas fa-plus-circle" style="color:var(--brand-success)"></i><div>Thu nhập ổn định <strong>(+0.27)</strong></div></div>
            <div class="alert-box alert-danger"><i class="fas fa-minus-circle" style="color:var(--brand-danger)"></i><div>Nợ hiện tại cao <strong>(-0.19)</strong></div></div>
            <div class="alert-box alert-danger"><i class="fas fa-minus-circle" style="color:var(--brand-danger)"></i><div>DTI gần ngưỡng <strong>(-0.14)</strong></div></div>
            <div style="margin-top:16px;padding:14px;background:#FEF3C7;border-radius:10px;font-size:.85rem"><i class="fas fa-lightbulb" style="color:var(--brand-warning);margin-right:6px"></i><strong>Counterfactual:</strong> Tăng thu nhập 2.2M hoặc giảm khoản vay 50M → 760+</div>
            @if(loan.status==='REVIEWING'){<button class="btn btn-primary" style="width:100%;margin-top:16px"><i class="fas fa-user-edit"></i> Override AI & Phê duyệt</button>}
          </div>
        </div>
        }@else{<div class="card" style="text-align:center;padding:40px"><i class="fas fa-robot" style="font-size:3rem;color:var(--text-tertiary);margin-bottom:12px;display:block"></i><p>AI Scoring chưa được thực hiện cho hồ sơ này</p></div>}
      }

      @if(tab==='timeline'){
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-history"></i> Timeline</h3></div>
        @for(t of loan.timeline;track t.timestamp){
        <div class="timeline-item">
          <div class="tl-dot" [class]="t.status==='APPROVED'||t.status==='DISBURSED'?'dot-green':t.status==='REJECTED'?'dot-red':t.status==='AI_SCORING'?'dot-orange':'dot-blue'"><i class="fas fa-circle" style="font-size:.5rem"></i></div>
          <div class="tl-content"><div class="tl-title">{{t.action}}</div><div class="tl-meta">{{t.actor}} · {{t.timestamp|date:'dd/MM/yyyy HH:mm'}}</div>@if(t.details){<div class="tl-detail">{{t.details}}</div>}</div>
        </div>}
        @if(loan.timeline.length===0){<p style="text-align:center;color:var(--text-tertiary);padding:30px">Chưa có timeline</p>}
      </div>}
      
      <!-- Mock Approval Form -->
      @if(showApproveModal){
        <div class="modal-overlay" (click)="showApproveModal=false">
          <div class="modal-content" style="width:500px;max-width:90%" (click)="$event.stopPropagation()">
            <h2 style="margin-bottom:16px;font-size:1.4rem"><i class="fas fa-check-circle" style="color:var(--brand-success);margin-right:8px"></i>Phê duyệt khoản vay</h2>
            
            <div style="margin-bottom:16px">
              <label style="display:block;margin-bottom:6px;font-weight:600;font-size:.85rem">Quyết định tín dụng</label>
              <select style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border-light);background:#fff">
                <option>Đồng ý phê duyệt 100% hạn mức ({{loan.amount/1e6}}M)</option>
                <option>Đồng ý phê duyệt có điều kiện giảm hạn mức</option>
              </select>
            </div>
            
            <div style="margin-bottom:16px">
              <label style="display:block;margin-bottom:6px;font-weight:600;font-size:.85rem">Ghi chú phê duyệt (bắt buộc)</label>
              <textarea style="width:100%;height:80px;padding:10px;border-radius:6px;border:1px solid var(--border-light);resize:none" placeholder="Nhập lý do phê duyệt, ĐK giải ngân..."></textarea>
            </div>
            
            <div style="margin-bottom:24px">
              <label style="display:block;margin-bottom:6px;font-weight:600;font-size:.85rem">Chữ ký điện tử (e-Signature HSM/Token)</label>
              <div style="border:2px dashed var(--border-light);border-radius:8px;height:140px;background:#f8fafc;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative">
                @if(signatureImg){
                  <img [src]="signatureImg" style="max-height:100px;max-width:90%">
                  <button class="btn btn-sm btn-secondary" style="position:absolute;top:8px;right:8px;font-size:.7rem" (click)="signatureImg=''"><i class="fas fa-eraser"></i> Ký lại</button>
                  <div style="position:absolute;bottom:8px;right:8px;font-size:.65rem;color:var(--brand-success)"><i class="fas fa-shield-alt"></i> Xác thực HSM (Valid)</div>
                } @else {
                  <i class="fas fa-file-signature" style="font-size:2rem;color:var(--text-tertiary);margin-bottom:12px"></i>
                  <button class="btn btn-outline btn-sm" (click)="sign()"><i class="fas fa-pen-nib"></i> Thực hiện ký số</button>
                }
              </div>
            </div>
            
            <div style="display:flex;justify-content:flex-end;gap:12px;border-top:1px solid var(--border-light);padding-top:16px">
              <button class="btn btn-secondary" (click)="showApproveModal=false">Hủy bỏ</button>
              <button class="btn btn-success" [disabled]="!signatureImg" (click)="confirmApprove()" [style.opacity]="!signatureImg?0.5:1"><i class="fas fa-paper-plane"></i> Ký & Ra quyết định</button>
            </div>
          </div>
        </div>
      }
    }</div>`,
  styles: ['.status-submitted{background:#E0E7FF;color:#3730A3}.status-ai_scoring{background:#FEF3C7;color:#92400E}.status-reviewing{background:#EFF6FF;color:#1E40AF}.status-approved,.status-conditionally_approved{background:#ECFDF5;color:#065F46}.status-rejected{background:#FEF2F2;color:#991B1B}.status-disbursed{background:#F0FDF4;color:#166534}']
})
export class LoanDetailComponent implements OnInit {
  loan: LoanApplication | null = null; tab = 'detail'; actionModal = signal('');

  showApproveModal = false;
  signatureImg = '';
  selectedPdf = '';
  uploadedFiles: File[] = [];
  docList = [
    { name: 'CCCD mặt trước', type: 'CCCD', uploaded: '15/01/2024', ocr: true, url: '/assets/sample.pdf' },
    { name: 'Sao kê lương T1-T6/2025', type: 'BANK_STATEMENT', uploaded: '01/07/2025', ocr: true, url: '/assets/sample.pdf' },
    { name: 'Hợp đồng mua bán', type: 'CONTRACT', uploaded: '22/02/2026', ocr: false, url: '/assets/sample.pdf' },
  ];

  constructor(private route: ActivatedRoute, private m: MockDataService) { }
  ngOnInit() { const id = this.route.snapshot.paramMap.get('id'); this.loan = this.m.getLoans().find(l => l.id === id) || null; if (this.loan?.aiScore) this.tab = 'detail'; }
  getProduct(t: string) { return { CONSUMER: 'Tiêu dùng', MORTGAGE: 'Mua nhà', BUSINESS: 'SXKD', CREDIT_CARD: 'Thẻ TD' }[t] || t; }
  getStatus(s: string) { return { DRAFT: 'Nháp', SUBMITTED: 'Nộp mới', PRE_SCREENING: 'Pre-screen', AI_SCORING: 'AI Scoring', REVIEWING: 'Thẩm định', APPROVED: 'Đã duyệt', CONDITIONALLY_APPROVED: 'Duyệt ĐK', REJECTED: 'Từ chối', DISBURSED: 'Giải ngân' }[s] || s; }

  sign() {
    this.signatureImg = 'https://upload.wikimedia.org/wikipedia/commons/f/fb/John_Hancock_signature.svg';
  }

  confirmApprove() {
    if (this.loan) {
      this.loan.status = 'APPROVED';
      this.loan.timeline.push({
        action: 'Phê duyệt',
        actor: 'Current User',
        timestamp: new Date().toISOString(),
        details: 'Phê duyệt bằng Chữ ký số HSM',
        status: 'APPROVED'
      });
    }
    this.showApproveModal = false;
  }

  onFileSelect(event: any) { this.uploadedFiles.push(...event.addedFiles); }
  onFileRemove(f: File) { this.uploadedFiles = this.uploadedFiles.filter(x => x !== f); }
}
