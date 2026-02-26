import { Component, OnInit, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Customer, LoanApplication, CustomerDocument } from '../../core/models/data.models';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import * as L from 'leaflet';
@Component({
  selector: 'app-customer-detail', standalone: true, imports: [CommonModule, RouterModule, FormsModule, PdfViewerModule, NgxDropzoneModule, ImageCropperComponent],
  template: `
    <div class="page-container">@if(customer){
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
        <a routerLink="/customers" class="btn btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></a>
        <div style="flex:1"><h1 class="page-title">{{customer.fullName}}</h1><p class="page-subtitle" style="margin:0">{{customer.id}} · {{customer.province}} · {{getType(customer.customerType)}}</p></div>
        @if(customer.ekycVerified){<span class="badge badge-success" style="padding:8px 16px"><i class="fas fa-shield-alt"></i> eKYC Verified</span>}@else{<span class="badge badge-warning" style="padding:8px 16px"><i class="fas fa-clock"></i> eKYC Pending</span>}
        <span class="badge" [class]="customer.status==='ACTIVE'?'badge-success':'badge-danger'" style="padding:8px 16px">{{customer.status}}</span>
        <button class="btn btn-sm" [class]="editMode?'btn-primary':'btn-secondary'" (click)="editMode=!editMode"><i class="fas" [class]="editMode?'fa-save':'fa-edit'"></i> {{editMode?'Lưu':'Sửa'}}</button>
      </div>
      <div class="tab-group">
        <div class="tab-item" [class.active]="activeTab==='info'" (click)="activeTab='info'"><i class="fas fa-user" style="margin-right:6px"></i>Thông tin</div>
        <div class="tab-item" [class.active]="activeTab==='credit'" (click)="activeTab='credit'"><i class="fas fa-chart-line" style="margin-right:6px"></i>Tín dụng 360°</div>
        <div class="tab-item" [class.active]="activeTab==='ekyc'" (click)="activeTab='ekyc'"><i class="fas fa-id-card" style="margin-right:6px"></i>eKYC & CIC</div>
        <div class="tab-item" [class.active]="activeTab==='docs'" (click)="activeTab='docs'"><i class="fas fa-folder-open" style="margin-right:6px"></i>Tài liệu ({{customer.documents.length}})</div>
        <div class="tab-item" [class.active]="activeTab==='loans'" (click)="activeTab='loans'"><i class="fas fa-file-invoice-dollar" style="margin-right:6px"></i>Đơn vay ({{custLoans.length}})</div>
        <div class="tab-item" [class.active]="activeTab==='map'" (click)="activeTab='map';initCustMap()"><i class="fas fa-map-marker-alt" style="margin-right:6px"></i>Vị trí</div>
        <div class="tab-item" [class.active]="activeTab==='history'" (click)="activeTab='history'"><i class="fas fa-history" style="margin-right:6px"></i>Lịch sử</div>
      </div>
      @if(activeTab==='info'){
      <div class="row-flex">
        <div class="card col-8">
          <h3 style="margin-bottom:16px"><i class="fas fa-user" style="color:var(--brand-accent);margin-right:8px"></i>Thông tin cá nhân</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
            <div><small style="color:var(--text-tertiary)">CCCD/CMND</small><br>@if(editMode){<input type="text" [(ngModel)]="customer.cccd" style="width:100%;padding:6px 10px;border:1px solid var(--border-light);border-radius:6px;font-family:var(--font-mono)">}@else{<strong style="font-family:var(--font-mono);font-size:1rem">{{customer.cccd}}</strong>}</div>
            <div><small style="color:var(--text-tertiary)">Ngày sinh</small><br>@if(editMode){<input type="text" [(ngModel)]="customer.dateOfBirth" style="width:100%;padding:6px 10px;border:1px solid var(--border-light);border-radius:6px">}@else{<strong>{{customer.dateOfBirth}}</strong>}</div>
            <div><small style="color:var(--text-tertiary)">Giới tính</small><br>@if(editMode){<select [(ngModel)]="customer.gender" style="width:100%;padding:6px 10px;border:1px solid var(--border-light);border-radius:6px"><option value="M">Nam</option><option value="F">Nữ</option></select>}@else{<strong>{{customer.gender==='M'?'Nam':'Nữ'}}</strong>}</div>
            <div><small style="color:var(--text-tertiary)">Số điện thoại</small><br>@if(editMode){<input type="text" [(ngModel)]="customer.phone" style="width:100%;padding:6px 10px;border:1px solid var(--border-light);border-radius:6px">}@else{<strong>{{customer.phone}}</strong>}</div>
            <div><small style="color:var(--text-tertiary)">Email</small><br>@if(editMode){<input type="text" [(ngModel)]="customer.email" style="width:100%;padding:6px 10px;border:1px solid var(--border-light);border-radius:6px">}@else{<strong>{{customer.email}}</strong>}</div>
            <div><small style="color:var(--text-tertiary)">Phân loại</small><br>@if(editMode){<select [(ngModel)]="customer.customerType" style="width:100%;padding:6px 10px;border:1px solid var(--border-light);border-radius:6px"><option value="INDIVIDUAL">Cá nhân</option><option value="HOUSEHOLD">Hộ KD</option><option value="SME">DN SME</option></select>}@else{<strong>{{getType(customer.customerType)}}</strong>}</div>
            <div style="grid-column:span 2"><small style="color:var(--text-tertiary)">Địa chỉ</small><br>@if(editMode){<input type="text" [(ngModel)]="customer.address" style="width:100%;padding:6px 10px;border:1px solid var(--border-light);border-radius:6px">}@else{<strong>{{customer.address}}, {{customer.province}}</strong>}</div>
            <div><small style="color:var(--text-tertiary)">Ngày tạo hồ sơ</small><br><strong>{{customer.createdAt}}</strong></div>
          </div>
        </div>
        <div class="card col-4">
          <h3 style="margin-bottom:16px">Điểm tín dụng</h3>
          <div style="text-align:center;margin-bottom:20px">
            <svg viewBox="0 0 120 120" style="width:140px;height:140px">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#E2E8F0" stroke-width="10"/>
              <circle cx="60" cy="60" r="54" fill="none" [attr.stroke]="getScoreColor(customer.internalScore)" stroke-width="10" stroke-dasharray="339.29" [attr.stroke-dashoffset]="339.29*(1-customer.internalScore/1000)" stroke-linecap="round" transform="rotate(-90 60 60)"/>
            </svg>
            <div style="margin-top:-90px;margin-bottom:50px"><div style="font-size:2.5rem;font-weight:800" [style.color]="getScoreColor(customer.internalScore)">{{customer.internalScore}}</div><small style="color:var(--text-tertiary)">/ 1000 · Nội bộ</small></div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px"><span>CIC Score</span><strong>{{customer.cicScore||'-'}}</strong></div>
            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px"><span>Hạn mức TD</span><strong>{{(customer.creditLimit/1e6).toFixed(0)}}M</strong></div>
            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px"><span>Tổng dư nợ</span><strong [style.color]="customer.totalOutstanding/customer.creditLimit>0.8?'var(--brand-danger)':'var(--text-primary)'">{{(customer.totalOutstanding/1e6).toFixed(0)}}M</strong></div>
            <div style="display:flex;justify-content:space-between;padding:10px 12px;background:var(--bg-tertiary);border-radius:8px"><span>Sử dụng</span><strong>{{(customer.totalOutstanding/customer.creditLimit*100).toFixed(0)}}%</strong></div>
          </div>
        </div>
      </div>}
      @if(activeTab==='credit'){
      <div class="row-flex">
        <div class="card col-8">
          <div class="card-header"><h3><i class="fas fa-chart-line"></i> Lịch sử điểm tín dụng</h3><span class="badge badge-tech">ECharts</span></div>
          <div style="display:flex;gap:4px;align-items:flex-end;height:160px;padding:8px">
            @for(p of scoreHistory;track p.month){<div style="flex:1;text-align:center"><div [style.height.px]="p.score/6" style="background:var(--brand-accent);border-radius:4px 4px 0 0;opacity:.7;margin:0 auto;width:80%"></div><small style="font-size:.6rem;color:var(--text-tertiary)">{{p.month}}</small></div>}
          </div>
          <div style="margin-top:16px"><h4 style="margin-bottom:10px">Sản phẩm tín dụng đang sử dụng</h4>
            @for(p of products;track p.name){<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--border-light)"><div><strong>{{p.name}}</strong><br><small style="color:var(--text-tertiary)">{{p.type}} · {{p.rate}}%/năm</small></div><div style="text-align:right"><strong>{{p.balance}}</strong><br><small style="color:var(--text-tertiary)">Dư nợ</small></div><span class="badge" [class]="p.status==='Normal'?'badge-success':'badge-warning'">{{p.status}}</span></div>}
          </div>
        </div>
        <div class="card col-4">
          <h3 style="margin-bottom:16px"><i class="fas fa-exclamation-triangle" style="color:var(--brand-warning);margin-right:8px"></i>Cảnh báo</h3>
          <div class="alert-box alert-warning"><i class="fas fa-clock" style="color:var(--brand-warning)"></i><div><strong>Chậm thanh toán</strong><br><small>2 ngày trễ hạn tháng 1/2026</small></div></div>
          <div class="alert-box alert-info"><i class="fas fa-info-circle" style="color:var(--brand-accent)"></i><div><strong>Sử dụng hạn mức cao</strong><br><small>{{(customer.totalOutstanding/customer.creditLimit*100).toFixed(0)}}% hạn mức</small></div></div>
          <h4 style="margin-top:20px;margin-bottom:10px">Hành vi thanh toán</h4>
          <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:3px">@for(m of paymentHistory;track m.m){<div style="height:24px;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:.55rem;font-weight:700;color:#fff" [style.background]="m.status==='on-time'?'#059669':m.status==='late'?'#D97706':'#DC2626'" [title]="m.m">{{m.m.slice(0,1)}}</div>}</div>
          <div style="display:flex;gap:12px;margin-top:8px;font-size:.7rem;color:var(--text-tertiary)"><span><span style="display:inline-block;width:10px;height:10px;background:#059669;border-radius:2px;margin-right:3px"></span>Đúng hạn</span><span><span style="display:inline-block;width:10px;height:10px;background:#D97706;border-radius:2px;margin-right:3px"></span>Trễ</span></div>
        </div>
      </div>}
      @if(activeTab==='ekyc'){
      <div class="row-flex">
        <div class="card col-6">
          <div class="card-header"><h3><i class="fas fa-id-card"></i> eKYC Verification (KH001)</h3><span class="badge" [class]="customer.ekycVerified?'badge-success':'badge-warning'">{{customer.ekycVerified?'VERIFIED':'PENDING'}}</span></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
            <div style="border:2px dashed var(--border-light);border-radius:12px;padding:24px;text-align:center;background:var(--bg-tertiary)"><i class="fas fa-id-card" style="font-size:2.5rem;color:var(--brand-accent);margin-bottom:8px;display:block"></i><strong>CCCD Mặt trước</strong><br><small style="color:var(--text-tertiary)">Uploaded 15/01/2024</small><div style="margin-top:8px"><span class="badge badge-success"><i class="fas fa-check"></i> OCR Done</span></div></div>
            <div style="border:2px dashed var(--border-light);border-radius:12px;padding:24px;text-align:center;background:var(--bg-tertiary)"><i class="fas fa-id-card" style="font-size:2.5rem;color:var(--brand-accent);margin-bottom:8px;display:block;transform:scaleX(-1)"></i><strong>CCCD Mặt sau</strong><br><small style="color:var(--text-tertiary)">Uploaded 15/01/2024</small><div style="margin-top:8px"><span class="badge badge-success"><i class="fas fa-check"></i> OCR Done</span></div></div>
          </div>
          <h4 style="margin-bottom:12px"><i class="fas fa-camera" style="margin-right:6px;color:var(--brand-accent)"></i>Face Recognition</h4>
          <div style="display:flex;gap:16px;align-items:center;padding:16px;background:var(--bg-tertiary);border-radius:12px;margin-bottom:16px">
            <div style="width:80px;height:80px;border-radius:50%;background:#2563EB;display:flex;align-items:center;justify-content:center"><i class="fas fa-user" style="font-size:2rem;color:#fff"></i></div>
            <div style="flex:1;text-align:center"><i class="fas fa-arrows-alt-h" style="font-size:1.5rem;color:var(--brand-success)"></i><div style="font-size:.8rem;margin-top:4px">Matching</div></div>
            <div style="width:80px;height:80px;border-radius:50%;background:#059669;display:flex;align-items:center;justify-content:center"><i class="fas fa-id-badge" style="font-size:2rem;color:#fff"></i></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="padding:12px;background:var(--bg-tertiary);border-radius:8px"><small style="color:var(--text-tertiary)">Similarity Score</small><br><strong style="font-size:1.3rem;color:var(--brand-success)">98.5%</strong></div>
            <div style="padding:12px;background:var(--bg-tertiary);border-radius:8px"><small style="color:var(--text-tertiary)">Liveness Check</small><br><strong style="font-size:1.3rem;color:var(--brand-success)">PASS</strong></div>
            <div style="padding:12px;background:var(--bg-tertiary);border-radius:8px"><small style="color:var(--text-tertiary)">Ngày xác thực</small><br><strong>15/01/2024 14:22</strong></div>
            <div style="padding:12px;background:var(--bg-tertiary);border-radius:8px"><small style="color:var(--text-tertiary)">Phương thức</small><br><strong>Face Recognition API v2</strong></div>
          </div>
          @if(!customer.ekycVerified){<button class="btn btn-primary" style="width:100%;margin-top:16px"><i class="fas fa-camera"></i> Bắt đầu eKYC</button>}
        </div>
        <div class="card col-6">
          <div class="card-header"><h3><i class="fas fa-university"></i> CIC – Trung tâm Thông tin Tín dụng</h3><span class="badge badge-tech">REST API</span></div>
          <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
            <div class="kpi-card kpi-blue" style="padding:12px"><div class="kpi-label">CIC Score</div><div class="kpi-value" style="font-size:1.4rem">{{customer.cicScore||720}}</div></div>
            <div class="kpi-card kpi-green" style="padding:12px"><div class="kpi-label">Xếp hạng</div><div class="kpi-value" style="font-size:1.2rem">AA</div></div>
            <div class="kpi-card" style="padding:12px;border-left:4px solid var(--brand-success)"><div class="kpi-label">Blacklist</div><div class="kpi-value" style="font-size:1.2rem;color:var(--brand-success)">CLEAR</div></div>
          </div>
          <h4 style="margin-bottom:10px">Lịch sử tín dụng CIC</h4>
          @for(c of cicHistory;track c.org){<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border-light)">
            <div><strong>{{c.org}}</strong><br><small style="color:var(--text-tertiary)">{{c.product}} · {{c.openDate}}</small></div>
            <div style="text-align:right"><strong>{{c.amount}}</strong><br><small>Nhóm nợ: <span [style.color]="c.debtGroup<=2?'var(--brand-success)':'var(--brand-danger)'">{{c.debtGroup}}</span></small></div>
            <span class="badge" [class]="c.status==='Active'?'badge-success':'badge-info'">{{c.status}}</span>
          </div>}
          <div style="margin-top:16px;padding:14px;background:#EFF6FF;border-radius:10px;font-size:.82rem"><i class="fas fa-sync" style="color:var(--brand-accent);margin-right:6px"></i><strong>Cập nhật lần cuối:</strong> 20/02/2026 · Nguồn: CIC API Gateway<br><button class="btn btn-sm btn-secondary" style="margin-top:8px"><i class="fas fa-sync"></i> Truy vấn CIC mới nhất</button></div>
        </div>
      </div>}
      @if(activeTab==='docs'){
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-folder-open"></i> Quản lý tài liệu (KH004)</h3><button class="btn btn-primary btn-sm" (click)="showUpload=true"><i class="fas fa-upload"></i> Upload tài liệu</button></div>
        @if(showUpload){
          <div style="margin-bottom:20px;padding:20px;border:2px dashed var(--border-light);border-radius:12px;background:#f8fafc">
            <ngx-dropzone (change)="onSelect($event)" [multiple]="true" accept="image/jpeg,image/png,application/pdf">
              <ngx-dropzone-label>Kéo thả hoặc click để chọn file tài liệu (PDF, JPG, PNG)</ngx-dropzone-label>
              @for(f of files; track f.name){<ngx-dropzone-preview [removable]="true" (removed)="onRemove(f)"><ngx-dropzone-label>{{ f.name }}</ngx-dropzone-label></ngx-dropzone-preview>}
            </ngx-dropzone>
            <div style="margin-top:12px;text-align:right">
              <button class="btn btn-secondary btn-sm" style="margin-right:8px" (click)="showUpload=false;files=[]">Hủy</button>
              <button class="btn btn-primary btn-sm" (click)="uploadFiles()"><i class="fas fa-microchip"></i> Tải lên & OCR</button>
            </div>
          </div>}
        @if(customer.documents.length===0){<div style="text-align:center;padding:40px;color:var(--text-tertiary)"><i class="fas fa-folder-open" style="font-size:3rem;margin-bottom:12px;display:block"></i><p>Chưa có tài liệu nào</p></div>}
        @else{
          <div style="display:flex;gap:20px">
            <div style="flex:1">
              <table class="data-table"><thead><tr><th>Tên tài liệu</th><th>Loại</th><th>Ngày upload</th><th>OCR</th><th>Hạn</th><th></th></tr></thead><tbody>
                @for(d of customer.documents;track d.id){<tr [style.background]="selectedDoc?.id===d.id?'var(--bg-hover)':'transparent'"><td><i class="fas" [class]="d.fileUrl.endsWith('.pdf')?'fa-file-pdf':'fa-image'" [style.color]="d.fileUrl.endsWith('.pdf')?'#DC2626':'#2563EB'" style="margin-right:8px"></i><strong>{{d.name}}</strong></td><td><span class="badge badge-info">{{d.type}}</span></td><td>{{d.uploadedAt}}</td><td>@if(d.ocrExtracted){<span class="badge badge-success"><i class="fas fa-check"></i> Đã trích xuất</span>}@else{<span class="badge badge-warning">Chờ</span>}</td><td><small style="color:var(--text-tertiary)">12/2026</small></td><td><button class="btn btn-sm btn-secondary" (click)="viewDoc(d)"><i class="fas fa-eye"></i> Xem</button></td></tr>}
              </tbody></table>
            </div>
            @if(selectedDoc){
              <div style="flex:1;border:1px solid var(--border-light);border-radius:12px;overflow:hidden;background:#fff;display:flex;flex-direction:column;min-height:400px">
                <div style="padding:12px 16px;background:var(--bg-tertiary);border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center">
                  <h4 style="margin:0;font-size:.9rem">{{selectedDoc.name}}</h4>
                  <div>
                    @if(selectedDoc.fileUrl.endsWith('.jpg') || selectedDoc.fileUrl.endsWith('.png')){<button class="btn btn-sm" [class]="cropMode?'btn-primary':'btn-secondary'" style="margin-right:8px" (click)="cropMode=!cropMode"><i class="fas fa-crop"></i> {{cropMode?'Xong':'Cắt ảnh'}}</button>}
                    <button class="btn btn-sm btn-secondary" (click)="selectedDoc=null"><i class="fas fa-times"></i></button>
                  </div>
                </div>
                <div style="flex:1;padding:16px;overflow-y:auto;background:#e2e8f0;display:flex;justify-content:center;align-items:flex-start">
                  @if(selectedDoc.fileUrl.endsWith('.pdf')){<pdf-viewer [src]="'/assets/dummy.pdf'" [original-size]="false" style="width:100%;height:600px;display:block"></pdf-viewer>}
                  @else{@if(cropMode){<div style="width:100%;background:#fff;padding:2px"><image-cropper [imageURL]="'https://via.placeholder.com/800x500/1e293b/ffffff?text=Identity+Card+OCR+Sample'" [maintainAspectRatio]="false" format="jpeg" (imageCropped)="imageCropped($event)"></image-cropper>@if(croppedImage){<div style="margin-top:16px;padding-top:16px;border-top:1px dashed var(--border-light)"><div style="display:flex;justify-content:space-between;margin-bottom:8px"><strong>Kết quả cắt:</strong> <button class="btn btn-sm btn-primary"><i class="fas fa-cogs"></i> Chạy OCR</button></div><img [src]="croppedImage" style="max-height:150px;border:1px solid var(--border-light);border-radius:6px"></div>}</div>}@else{<img [src]="'https://via.placeholder.com/600x400/1e293b/ffffff?text=Document+Viewer'" style="max-width:100%;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1)">}}
                </div>
              </div>}
          </div>}
      </div>}
      @if(activeTab==='loans'){
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-file-invoice-dollar"></i> Đơn vay liên quan</h3><a routerLink="/loans/new" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Tạo đơn vay</a></div>
        @if(custLoans.length===0){<p style="color:var(--text-tertiary);text-align:center;padding:30px">Chưa có đơn vay nào</p>}
        @else{<table class="data-table"><thead><tr><th>Mã đơn</th><th>Sản phẩm</th><th>Số tiền</th><th>Kỳ hạn</th><th>AI Score</th><th>Trạng thái</th><th></th></tr></thead><tbody>
          @for(l of custLoans;track l.id){<tr><td><strong>{{l.id}}</strong></td><td>{{l.productType}}</td><td>{{(l.amount/1e6)}}M</td><td>{{l.term}} tháng</td><td>@if(l.aiScore){<strong [style.color]="l.aiScore.totalScore>=700?'var(--brand-success)':'var(--brand-warning)'">{{l.aiScore.totalScore}}</strong>}@else{—}</td><td><span class="badge" [class]="l.status==='APPROVED'||l.status==='DISBURSED'?'badge-success':l.status==='REJECTED'?'badge-danger':'badge-info'">{{l.status}}</span></td><td><a [routerLink]="'/loans/'+l.id" class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i></a></td></tr>}
        </tbody></table>}
      </div>}
      @if(activeTab==='map'){
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-map-marker-alt"></i> Vị trí Khách hàng (Leaflet)</h3><span class="badge badge-tech">Leaflet GeoMap</span></div>
        <div #custMapContainer style="height:400px;border-radius:10px;overflow:hidden;border:1px solid var(--border-light)"></div>
        <div style="margin-top:12px;padding:12px;background:var(--bg-tertiary);border-radius:8px;font-size:.85rem"><i class="fas fa-map-pin" style="margin-right:6px;color:var(--brand-accent)"></i><strong>{{customer.address}}, {{customer.province}}</strong></div>
      </div>}
      @if(activeTab==='history'){
      <div class="card">
        <div class="card-header"><h3><i class="fas fa-history"></i> Lịch sử hoạt động (Audit Trail)</h3></div>
        @for(h of auditHistory;track h.ts){<div class="timeline-item"><div class="tl-dot" [class]="h.dotClass"><i [class]="h.icon"></i></div><div class="tl-content"><div class="tl-title">{{h.action}}</div><div class="tl-meta">{{h.actor}} · {{h.ts}}</div>@if(h.detail){<div class="tl-detail">{{h.detail}}</div>}</div></div>}
      </div>}
    }</div>`, styles: ['']
})
export class CustomerDetailComponent implements OnInit {
  @ViewChild('custMapContainer') custMapContainer!: ElementRef;
  customer: Customer | null = null; custLoans: LoanApplication[] = []; activeTab = 'info'; editMode = false;
  custMap: any = null;
  scoreHistory = [{ month: 'T3', score: 680 }, { month: 'T4', score: 690 }, { month: 'T5', score: 695 }, { month: 'T6', score: 710 }, { month: 'T7', score: 715 }, { month: 'T8', score: 718 }, { month: 'T9', score: 720 }, { month: 'T10', score: 725 }, { month: 'T11', score: 728 }, { month: 'T12', score: 730 }, { month: 'T1', score: 731 }, { month: 'T2', score: 731 }];
  products = [{ name: 'Vay tiêu dùng #VTD-001', type: 'Consumer', rate: 9.5, balance: '180M', status: 'Normal' }, { name: 'Thẻ tín dụng Visa Gold', type: 'Credit Card', rate: 18, balance: '12M', status: 'Normal' }];
  paymentHistory = [{ m: 'T3', status: 'on-time' }, { m: 'T4', status: 'on-time' }, { m: 'T5', status: 'on-time' }, { m: 'T6', status: 'on-time' }, { m: 'T7', status: 'on-time' }, { m: 'T8', status: 'late' }, { m: 'T9', status: 'on-time' }, { m: 'T10', status: 'on-time' }, { m: 'T11', status: 'on-time' }, { m: 'T12', status: 'on-time' }, { m: 'T1', status: 'late' }, { m: 'T2', status: 'on-time' }];
  cicHistory = [
    { org: 'BIDV', product: 'Vay tiêu dùng', openDate: '03/2023', amount: '200M', debtGroup: 1, status: 'Active' },
    { org: 'Techcombank', product: 'Thẻ tín dụng', openDate: '01/2022', amount: '50M', debtGroup: 1, status: 'Active' },
    { org: 'VPBank', product: 'Vay mua xe', openDate: '06/2020', amount: '350M', debtGroup: 1, status: 'Closed' },
    { org: 'FE Credit', product: 'Tín dụng tiêu dùng', openDate: '11/2019', amount: '30M', debtGroup: 2, status: 'Closed' }
  ];
  auditHistory = [
    { action: 'Cập nhật điểm nội bộ: 728 → 731', actor: 'AI Engine', ts: '25/02/2026 09:00', icon: 'fas fa-robot', dotClass: 'dot-blue', detail: '' },
    { action: 'Truy vấn CIC cập nhật', actor: 'System Auto', ts: '20/02/2026 00:30', icon: 'fas fa-university', dotClass: 'dot-green', detail: 'CIC Score: 720 · Nhóm nợ: 1' },
    { action: 'Upload sao kê lương T1-T6/2025', actor: 'Nguyễn Văn An', ts: '01/07/2025 10:30', icon: 'fas fa-upload', dotClass: 'dot-green', detail: 'OCR trích xuất: Thu nhập TB 15.8M/tháng' },
    { action: 'Cập nhật địa chỉ', actor: 'Nguyễn Văn An', ts: '15/03/2025 09:00', icon: 'fas fa-edit', dotClass: 'dot-blue', detail: 'Thay đổi: 123 Nguyễn Huệ → 456 Lê Lợi' },
    { action: 'eKYC xác thực thành công', actor: 'Face Recognition API', ts: '15/01/2024 14:22', icon: 'fas fa-check', dotClass: 'dot-green', detail: 'Độ tương đồng: 98.5%' },
    { action: 'Tạo hồ sơ khách hàng', actor: 'Nguyễn Văn An', ts: '15/01/2024 14:00', icon: 'fas fa-plus', dotClass: 'dot-blue', detail: 'Phân loại: Cá nhân' },
  ];
  constructor(private route: ActivatedRoute, private m: MockDataService) { }
  ngOnInit() { const id = this.route.snapshot.paramMap.get('id'); this.customer = this.m.getCustomers().find(c => c.id === id) || null; if (this.customer) this.custLoans = this.m.getLoans().filter(l => l.customerId === this.customer!.id); }
  getType(t: string) { return { INDIVIDUAL: 'Cá nhân', HOUSEHOLD: 'Hộ KD', SME: 'DN SME' }[t] || t; }
  getScoreColor(s: number) { return s >= 700 ? '#059669' : s >= 500 ? '#D97706' : '#DC2626'; }
  showUpload = false; files: File[] = []; selectedDoc: CustomerDocument | null = null; cropMode = false; croppedImage: any = '';
  onSelect(event: any) { this.files.push(...event.addedFiles); }
  onRemove(event: any) { this.files.splice(this.files.indexOf(event), 1); }
  uploadFiles() { this.files.forEach(f => { this.customer?.documents.push({ id: 'DOC-' + Date.now(), name: f.name, type: 'OTHER', fileUrl: f.name.toLowerCase().endsWith('.pdf') ? 'dummy.pdf' : 'dummy.jpg', uploadedAt: new Date().toLocaleDateString('vi-VN'), ocrExtracted: false }); }); this.files = []; this.showUpload = false; }
  viewDoc(d: CustomerDocument) { this.selectedDoc = d; this.cropMode = false; this.croppedImage = ''; }
  imageCropped(event: ImageCroppedEvent) { this.croppedImage = event.objectUrl || event.base64 || ''; }
  initCustMap() {
    setTimeout(() => {
      if (this.custMap || !this.custMapContainer) return;
      const coords: Record<string, [number, number]> = { 'TP. Hồ Chí Minh': [10.8231, 106.6297], 'Hà Nội': [21.0285, 105.8542], 'Đà Nẵng': [16.0544, 108.2022], 'Bình Dương': [11.0, 106.65], 'Cần Thơ': [10.0452, 105.7469], 'Hải Phòng': [20.8449, 106.6881] };
      const c = coords[this.customer?.province || ''] || [16.0, 106.0];
      this.custMap = L.map(this.custMapContainer.nativeElement).setView(c, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(this.custMap);
      L.marker(c).addTo(this.custMap).bindPopup(`<strong>${this.customer?.fullName}</strong><br>${this.customer?.address}, ${this.customer?.province}`).openPopup();
    }, 200);
  }
}
