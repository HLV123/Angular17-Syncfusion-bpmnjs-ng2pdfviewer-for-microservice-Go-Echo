import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { MockSocketService } from '../../core/services/mock-socket.service';
import { AuthService } from '../../core/auth/auth.service';
import { PortfolioSummary, LoanApplication, Notification, EWSAlert } from '../../core/models/data.models';

import { ChartModule, AccumulationChartModule, CategoryService, ColumnSeriesService, LegendService, TooltipService, DataLabelService, LineSeriesService, AccumulationTooltipService, PieSeriesService, AccumulationDataLabelService, AccumulationLegendService } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule, AccumulationChartModule],
  providers: [
    CategoryService, ColumnSeriesService, LegendService, TooltipService, DataLabelService, LineSeriesService,
    PieSeriesService, AccumulationLegendService, AccumulationTooltipService, AccumulationDataLabelService
  ],
  template: `
    <div class="page-container">
      <div class="dash-header">
        <div>
          <h1 class="page-title">Tổng quan tín dụng thông minh</h1>
          <p class="page-subtitle">
            <i class="far fa-clock"></i> Cập nhật: 25/02/2026 09:41
            <span class="badge badge-tech" style="margin-left:12px"><i class="fas fa-sync-alt"></i> Syncfusion · ag-Grid · D3.js</span>
            <span class="badge badge-success" style="margin-left:8px"><i class="fas fa-circle" style="font-size:6px"></i> Seldon · Kubeflow · SageMaker</span>
          </p>
        </div>
        <div class="dash-actions">
          <button class="btn btn-secondary btn-sm"><i class="fas fa-download"></i> Xuất báo cáo</button>
          <button class="btn btn-primary btn-sm" routerLink="/loans/new"><i class="fas fa-plus"></i> Tạo đơn vay</button>
        </div>
      </div>

      <!-- KPI CARDS -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon"><i class="fas fa-money-bill-wave"></i></div>
          <div class="kpi-label">Tổng dư nợ (tỷ VND)</div>
          <div class="kpi-value">{{ portfolio.totalOutstanding | number:'1.0-0' }}</div>
          <div class="kpi-trend trend-up"><i class="fas fa-arrow-up"></i> +2.4% so với tháng trước</div>
        </div>
        <div class="kpi-card kpi-orange">
          <div class="kpi-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="kpi-label">Tỷ lệ nợ xấu (NPL)</div>
          <div class="kpi-value">{{ portfolio.nplRatio }}%</div>
          <div class="kpi-trend trend-warn"><i class="fas fa-exclamation-triangle"></i> +0.08% (cảnh báo)</div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-icon"><i class="fas fa-check-circle"></i></div>
          <div class="kpi-label">Tỷ lệ duyệt vay</div>
          <div class="kpi-value">{{ portfolio.approvalRate }}%</div>
          <div class="kpi-trend trend-up"><i class="fas fa-balance-scale"></i> Fairness: 0.94 DI</div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-icon"><i class="fas fa-user-edit"></i></div>
          <div class="kpi-label">Override rate</div>
          <div class="kpi-value">{{ portfolio.overrideRate }}%</div>
          <div class="kpi-trend"><i class="fas fa-user-check"></i> human-in-the-loop</div>
        </div>
      </div>

      <!-- ROW: Executive Charts (Syncfusion) -->
      <div class="row-flex">
        <div class="card col-8">
          <div class="card-header">
            <h3><i class="fas fa-chart-column"></i> Volume hồ sơ xử lý (Syncfusion)</h3>
          </div>
          <ejs-chart id="chart-container" [primaryXAxis]='primaryXAxis' [tooltip]='tooltipSettings' height="280px">
              <e-series-collection>
                  <e-series [dataSource]='volumeData' type='Column' xName='month' yName='volume' name='Số lượng hồ sơ' fill='#2563EB' [cornerRadius]="{ topLeft: 4, topRight: 4 }"></e-series>
              </e-series-collection>
          </ejs-chart>
        </div>
        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-chart-pie"></i> Phân bổ rủi ro (Syncfusion Pie)</h3>
          </div>
          <ejs-accumulationchart id="pie-container" [tooltip]='tooltipSettings' [legendSettings]='legendSettings' height="280px">
            <e-accumulation-series-collection>
              <e-accumulation-series [dataSource]='riskData' xName='rating' yName='count' innerRadius='40%' [dataLabel]='dataLabel'></e-accumulation-series>
            </e-accumulation-series-collection>
          </ejs-accumulationchart>
        </div>
      </div>

      <!-- ROW 1: AI Scoring + Fairness -->
      <div class="row-flex">
        <div class="card col-6">
          <div class="card-header">
            <h3><i class="fas fa-microchip"></i> AI Scoring Pipeline</h3>
            <span class="badge badge-tech">gRPC (Seldon/Kubeflow) + REST (SageMaker)</span>
          </div>
          <div class="scoring-preview">
            <div class="scoring-top">
              <span><strong>Khoản vay #LV-2435</strong> (Nguyễn Thị Hồng)</span>
              <span class="status-badge status-approved">Điểm 731 / 1000 · Tốt</span>
            </div>
            <div class="scoring-body">
              <div class="score-circle">
                <svg viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#E2E8F0" stroke-width="8"/>
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#2563EB" stroke-width="8"
                          stroke-dasharray="339.29" [attr.stroke-dashoffset]="339.29 * (1 - 731/1000)"
                          stroke-linecap="round" transform="rotate(-90 60 60)"/>
                </svg>
                <span class="score-num">731</span>
              </div>
              <div class="score-dims">
                @for (dim of scoreDimensions; track dim.name) {
                  <div class="dim-row">
                    <span class="dim-name">{{ dim.name }}</span>
                    <div class="dim-bar"><div class="dim-fill" [style.width.%]="dim.score*100" [class]="dim.score > 0.6 ? 'good' : 'warn'"></div></div>
                    <span class="dim-val" [class]="dim.contribution > 0 ? 'pos' : 'neg'">{{ dim.contribution > 0 ? '+' : '' }}{{ dim.contribution }}</span>
                  </div>
                }
              </div>
            </div>
            <div class="shap-section">
              <div class="shap-title"><i class="fas fa-chart-bar"></i> SHAP Explanation (AIX360)</div>
              @for (f of shapValues; track f.name) {
                <div class="shap-row">
                  <span class="shap-name">{{ f.name }}</span>
                  <div class="shap-bar-wrap">
                    <div class="shap-bar" [class]="f.value > 0 ? 'positive' : 'negative'"
                         [style.width.%]="Math.abs(f.value) * 100"></div>
                  </div>
                  <span class="shap-val" [class]="f.value > 0 ? 'pos' : 'neg'">{{ f.value > 0 ? '+' : '' }}{{ f.value }}</span>
                </div>
              }
              <div class="counterfactual">
                <i class="fas fa-lightbulb"></i> Counterfactual: tăng thu nhập thêm 2.2M → điểm 760
              </div>
            </div>
          </div>
          <div class="card-footer-tech"><i class="fas fa-robot"></i> AIX360 + SHAP · D3.js waterfall</div>
        </div>

        <div class="card col-6">
          <div class="card-header">
            <h3><i class="fas fa-balance-scale"></i> Fairness & Bias (AIF360)</h3>
            <span class="badge badge-tech">protected: giới tính, vùng</span>
          </div>
          @for (fm of fairnessData; track fm.attribute) {
            <div class="fairness-row">
              <div class="fm-label">{{ fm.attribute }}</div>
              <div class="fm-meter">
                <div class="fm-bar">
                  <div class="fm-fill" [style.width.%]="fm.value * 100 / 1.25"
                       [class]="fm.status === 'PASS' ? 'pass' : 'warn'"></div>
                  <div class="fm-marker" style="left:64%"></div>
                </div>
                <div class="fm-vals">
                  <span class="fm-num">{{ fm.value }}</span>
                  <span class="fm-status badge" [class]="fm.status === 'PASS' ? 'badge-success' : 'badge-warning'">{{ fm.status }}</span>
                </div>
              </div>
            </div>
          }
          <div class="region-chart">
            <div class="region-title"><i class="fas fa-chart-bar"></i> Tỷ lệ duyệt theo vùng</div>
            <div class="region-bars">
              @for (r of regionData; track r.name) {
                <div class="region-col">
                  <div class="rbar-wrap">
                    <div class="rbar" [style.height.%]="r.rate"></div>
                  </div>
                  <span class="rbar-label">{{ r.name }}</span>
                  <span class="rbar-val">{{ r.rate }}%</span>
                </div>
              }
            </div>
          </div>
          <div class="card-footer-tech">
            <span class="badge badge-info">pre-processing: reweighing</span>
            <span class="badge badge-info">post-processing: equalized odds</span>
          </div>
        </div>
      </div>

      <!-- ROW 2: Model Registry + Adversarial + Alerts -->
      <div class="row-flex">
        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-cubes"></i> Model Governance</h3>
            <span class="badge badge-tech">ModelDB</span>
          </div>
          <div class="model-list">
            @for (m of topModels; track m.id) {
              <div class="model-row" [routerLink]="'/model-registry/' + m.id">
                <div class="model-info">
                  <strong>{{ m.name }} {{ m.version }}</strong>
                  <span class="model-meta">AUC {{ m.metrics.auc }} · {{ m.platform }}</span>
                </div>
                <span class="status-badge" [class]="'status-' + m.status.toLowerCase()">{{ m.status }}</span>
              </div>
            }
          </div>
          <div class="card-footer-tech"><i class="fas fa-code-branch"></i> canary 10% · challenger (v3.1.0) AUC 0.812</div>
        </div>

        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-shield-alt"></i> ART Adversarial</h3>
            <span class="badge badge-tech">ART · gRPC</span>
          </div>
          <div class="adv-stats">
            <span class="status-badge status-pending"><i class="fas fa-exclamation-triangle"></i> 3 evasion attempts (24h)</span>
            <span class="status-badge status-approved">robustness score 0.92</span>
          </div>
          <div class="attack-info">
            <div class="attack-row"><i class="fas fa-skull-crossbones"></i> FGSM: 6% success rate</div>
            <div class="attack-row"><i class="fas fa-skull-crossbones"></i> PGD: 2.1% success rate</div>
            <div class="progress-bar" style="margin:12px 0"><div class="progress-fill fill-success" style="width:92%"></div></div>
            <div class="anomaly-note"><i class="fas fa-exclamation-circle"></i> Anomaly: hồ sơ #8872 có dấu hiệu data poisoning</div>
          </div>
        </div>

        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-bell"></i> Cảnh báo real-time</h3>
            <span class="badge badge-tech">STOMP + WebSocket</span>
          </div>
          <div class="alert-list">
            @for (n of recentAlerts; track n.id) {
              <div class="alert-item" [routerLink]="n.actionUrl">
                <span class="alert-dot" [class]="'dot-' + n.severity.toLowerCase()"></span>
                <div class="alert-content">
                  <strong>{{ n.title }}</strong>
                  <span>{{ n.message }}</span>
                </div>
              </div>
            }
          </div>
          <div class="card-footer-tech"><i class="fas fa-envelope"></i> Notification center: {{ unreadCount }} chưa đọc</div>
        </div>
      </div>

      <!-- ROW 3: CRM + Map + Workflow -->
      <div class="row-flex">
        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-address-card"></i> CRM 360° khách hàng</h3>
            <span class="badge badge-tech">OCR / eKYC</span>
          </div>
          <div class="crm-preview">
            <div class="crm-customer">
              <div class="crm-avatar">NK</div>
              <div><strong>Nguyễn Thị Kim</strong> <span class="badge badge-primary">CCCD: OCR done</span><br>
              <small>Điểm nội bộ 725, hạn mức 180M</small></div>
            </div>
            <div class="crm-docs">
              <i class="fas fa-file-pdf"></i> Sao kê ngân hàng (PDF) · <i class="fas fa-image"></i> CCCD mặt trước/sau
            </div>
            <div class="crm-tech">ng2-pdf-viewer • ngx-dropzone • ngx-image-cropper</div>
          </div>
        </div>

        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-map-marked-alt"></i> Phân bổ rủi ro (Leaflet)</h3>
            <span class="badge badge-tech">Geo · tỉnh thành</span>
          </div>
          <div id="risk-map" style="height: 200px; width: 100%; border-radius: 8px; z-index: 1;"></div>
        </div>

        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-project-diagram"></i> Phê duyệt & BPMN</h3>
            <span class="badge badge-tech">bpmn-js viewer</span>
          </div>
          <div class="workflow-preview">
            <div class="wf-steps">
              <span class="wf-step done">📄 Tiếp nhận</span>
              <i class="fas fa-arrow-right"></i>
              <span class="wf-step done">🤖 AI Scoring</span>
              <i class="fas fa-arrow-right"></i>
              <span class="wf-step current">👤 Thẩm định</span>
              <i class="fas fa-arrow-right"></i>
              <span class="wf-step">✍️ Phê duyệt</span>
            </div>
            <div class="wf-progress"></div>
            <div class="wf-info">Hiện tại: <strong>Chờ credit officer</strong> (khoản vay 350M, analyst đề xuất duyệt)</div>
            <div class="wf-sla">⏱️ SLA: 2.4 giờ còn lại</div>
          </div>
        </div>
      </div>

      <!-- ROW 4: AutoML + IFRS 9 + Compliance -->
      <div class="row-flex">
        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-flask"></i> AutoML (H2O + IBM AutoAI)</h3>
            <span class="badge badge-tech">job #342 đang chạy</span>
          </div>
          <div>ROC so sánh: <small>model 17 AUC 0.89, model 22 AUC 0.91</small></div>
          <div class="automl-best">Leaderboard: XGBoost * 0.912 (selected)</div>
          <div class="progress-bar" style="margin-top:12px"><div class="progress-fill fill-primary" style="width:80%"></div></div>
          <small>Training 80% complete</small>
        </div>
        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-file-contract"></i> IFRS 9 / ECL</h3>
            <span class="badge badge-tech">Stage 1/2/3</span>
          </div>
          <div>ECL (tỷ đồng): Stage 1: {{ portfolio.eclStage1 }}, Stage 2: {{ portfolio.eclStage2 }}, Stage 3: {{ portfolio.eclStage3 }}</div>
          <div class="ecl-bars">
            <div class="ecl-bar s1" [style.width.%]="portfolio.eclStage1 / 2.5">S1</div>
            <div class="ecl-bar s2" [style.width.%]="portfolio.eclStage2 / 2.5">S2</div>
            <div class="ecl-bar s3" [style.width.%]="portfolio.eclStage3 / 2.5">S3</div>
          </div>
        </div>
        <div class="card col-4">
          <div class="card-header">
            <h3><i class="fas fa-file-alt"></i> Model Card & Compliance</h3>
            <span class="badge badge-tech">audit trail</span>
          </div>
          <div><i class="fas fa-check-circle" style="color:var(--brand-success)"></i> Thông tư 11/2021 · Basel III</div>
          <div style="margin-top:8px"><i class="fas fa-history"></i> Audit: 23/02/2026 - user 'risk01' xem fairness</div>
          <div style="margin-top:8px"><i class="fas fa-file-pdf"></i> IFRS 9 report · Compliance Q4/2025</div>
        </div>
      </div>

      <div class="dash-footer">
        ⚡ gRPC-Web (Seldon/Kubeflow) · REST (SageMaker, AIF360, AIX360) · STOMP/SockJS · NgRx state ·
        Angular 17+ · Syncfusion · ag-Grid · D3.js · Apache ECharts · Keycloak SSO · Prometheus/Grafana · Jaeger · K8s
      </div>
    </div>
  `,
  styles: [`
    .dash-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;flex-wrap:wrap;gap:12px}
    .dash-actions{display:flex;gap:10px}
    .kpi-card{position:relative;.kpi-icon{position:absolute;top:16px;right:16px;width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;opacity:.12;i{font-size:1.4rem}}}
    .scoring-preview{background:var(--bg-tertiary);border-radius:14px;padding:20px}
    .scoring-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px}
    .scoring-body{display:flex;gap:24px;margin-bottom:16px}
    .score-circle{position:relative;width:100px;height:100px;flex-shrink:0;svg{width:100%;height:100%}.score-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:var(--brand-accent)}}
    .score-dims{flex:1}
    .dim-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:.82rem}
    .dim-name{width:100px;color:var(--text-secondary);flex-shrink:0}
    .dim-bar{flex:1;height:6px;background:var(--border-light);border-radius:4px;overflow:hidden}
    .dim-fill{height:100%;border-radius:4px;transition:width .6s;&.good{background:var(--brand-accent)}&.warn{background:var(--brand-warning)}}
    .dim-val{width:40px;text-align:right;font-weight:600;font-size:.78rem;&.pos{color:var(--brand-success)}&.neg{color:var(--brand-danger)}}
    .shap-section{background:#fff;border-radius:12px;padding:14px;margin-top:12px}
    .shap-title{font-size:.82rem;font-weight:600;margin-bottom:10px;color:var(--text-secondary);i{margin-right:6px}}
    .shap-row{display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:.8rem}
    .shap-name{width:110px;color:var(--text-secondary);flex-shrink:0}
    .shap-bar-wrap{flex:1;height:8px;background:var(--border-light);border-radius:4px;overflow:hidden;position:relative}
    .shap-bar{height:100%;border-radius:4px;&.positive{background:#2563EB}&.negative{background:#DC2626}}
    .shap-val{width:45px;text-align:right;font-weight:600;font-family:var(--font-mono);font-size:.75rem;&.pos{color:var(--brand-success)}&.neg{color:var(--brand-danger)}}
    .counterfactual{margin-top:12px;padding:10px;background:#FEF3C7;border-radius:8px;font-size:.82rem;color:#92400E;i{margin-right:6px;color:#D97706}}
    .card-footer-tech{margin-top:14px;font-size:.78rem;color:var(--text-tertiary);i{margin-right:6px}}
    .fairness-row{margin-bottom:16px}
    .fm-label{font-size:.82rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px}
    .fm-meter{display:flex;flex-direction:column;gap:4px}
    .fm-bar{height:10px;background:var(--border-light);border-radius:6px;overflow:hidden;position:relative}
    .fm-fill{height:100%;border-radius:6px;transition:width .6s;&.pass{background:var(--brand-accent)}&.warn{background:var(--brand-warning)}}
    .fm-marker{position:absolute;top:-2px;width:2px;height:14px;background:var(--brand-danger)}
    .fm-vals{display:flex;justify-content:space-between;align-items:center}
    .fm-num{font-weight:700;font-family:var(--font-mono);font-size:.85rem}
    .region-chart{margin-top:20px;padding:16px;background:var(--bg-tertiary);border-radius:12px}
    .region-title{font-size:.82rem;font-weight:600;color:var(--text-secondary);margin-bottom:12px;i{margin-right:6px}}
    .region-bars{display:flex;gap:12px;align-items:flex-end;height:80px}
    .region-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
    .rbar-wrap{width:100%;height:60px;display:flex;align-items:flex-end}
    .rbar{width:100%;background:var(--brand-primary);border-radius:4px 4px 0 0;transition:height .4s;min-height:4px;opacity:.7}
    .rbar-label{font-size:.65rem;color:var(--text-tertiary)}
    .rbar-val{font-size:.72rem;font-weight:700;color:var(--text-primary)}
    .model-list{display:flex;flex-direction:column;gap:8px}
    .model-row{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-radius:10px;background:var(--bg-tertiary);cursor:pointer;transition:.15s;&:hover{background:var(--bg-hover)}.model-info{strong{font-size:.85rem;display:block}.model-meta{font-size:.75rem;color:var(--text-tertiary)}}}
    .status-production{background:#ECFDF5;color:#065F46}.status-staging{background:#EFF6FF;color:#1E40AF}.status-development{background:#F5F3FF;color:#5B21B6}.status-archived{background:#F1F5F9;color:#475569}
    .adv-stats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
    .attack-info{font-size:.85rem;.attack-row{margin-bottom:6px;i{margin-right:6px;color:var(--brand-danger)}}}
    .anomaly-note{margin-top:10px;padding:10px;background:#FEF2F2;border-radius:8px;font-size:.82rem;color:#991B1B;i{margin-right:6px}}
    .alert-list{display:flex;flex-direction:column;gap:8px;max-height:180px;overflow-y:auto}
    .alert-item{display:flex;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;&:hover{background:var(--bg-hover)}}
    .alert-dot{width:8px;height:8px;border-radius:50%;margin-top:6px;flex-shrink:0;&.dot-critical{background:var(--brand-danger)}&.dot-warning{background:var(--brand-warning)}&.dot-info{background:var(--brand-info)}}
    .alert-content{strong{font-size:.82rem;display:block}span{font-size:.75rem;color:var(--text-tertiary)}}
    .crm-preview{.crm-customer{display:flex;gap:12px;align-items:center;margin-bottom:12px;.crm-avatar{width:48px;height:48px;background:var(--brand-primary);color:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}strong{font-size:.92rem}small{color:var(--text-tertiary);font-size:.78rem}}.crm-docs{font-size:.82rem;color:var(--text-secondary);margin-bottom:8px;i{margin-right:4px}}.crm-tech{padding:8px;background:var(--bg-tertiary);border-radius:8px;font-size:.75rem;color:var(--text-tertiary);font-family:var(--font-mono)}}
    .map-placeholder{height:150px;background:linear-gradient(135deg,#CBD5E1 0%,#94A3B8 100%);border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-primary);gap:8px;i{font-size:2rem;opacity:.5}.map-data{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;span{font-size:.75rem;background:rgba(255,255,255,.7);padding:2px 8px;border-radius:4px}}}
    .workflow-preview{background:var(--bg-tertiary);border-radius:12px;padding:14px}
    .wf-steps{display:flex;align-items:center;justify-content:space-between;font-size:.75rem;gap:4px;flex-wrap:wrap;.wf-step{padding:4px 8px;border-radius:6px;background:var(--border-light);color:var(--text-secondary);&.done{background:#ECFDF5;color:#065F46}&.current{background:#EEF2FF;color:var(--brand-accent);font-weight:600;box-shadow:0 0 0 2px var(--brand-accent)}}i{font-size:.6rem;color:var(--text-tertiary)}}
    .wf-progress{height:3px;background:var(--border-light);border-radius:2px;margin:12px 0;position:relative;&::after{content:'';position:absolute;left:0;top:0;height:100%;width:60%;background:var(--brand-accent);border-radius:2px}}
    .wf-info{font-size:.85rem;margin-bottom:6px}
    .wf-sla{font-size:.82rem;color:var(--brand-warning);font-weight:600}
    .automl-best{background:var(--brand-primary);color:#fff;padding:8px 14px;border-radius:20px;font-family:var(--font-mono);font-size:.82rem;margin-top:8px;display:inline-block}
    .ecl-bars{display:flex;gap:4px;margin-top:12px;height:32px;align-items:flex-end}
    .ecl-bar{height:100%;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.7rem;font-weight:600;&.s1{background:#2563EB}&.s2{background:#F59E0B}&.s3{background:#DC2626}}
    .dash-footer{margin-top:20px;font-size:.72rem;color:var(--text-tertiary);text-align:right;border-top:1px dashed var(--border-light);padding-top:12px}
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  portfolio!: PortfolioSummary;
  recentLoans: LoanApplication[] = [];
  recentAlerts: Notification[] = [];
  topModels: any[] = [];
  unreadCount = 0;
  Math = Math;

  scoreDimensions = [
    { name: 'Thu nhập', score: 0.72, contribution: 0.32 },
    { name: 'Tài sản', score: 0.65, contribution: 0.18 },
    { name: 'Lịch sử TD', score: 0.80, contribution: 0.65 },
    { name: 'Hành vi', score: 0.58, contribution: -0.12 },
    { name: 'DTI', score: 0.45, contribution: -0.21 },
    { name: 'Thị trường', score: 0.62, contribution: 0.09 },
  ];

  shapValues = [
    { name: 'Thu nhập 15.8M', value: 0.27 },
    { name: 'Nợ hiện tại', value: -0.19 },
    { name: 'Lịch sử thanh toán', value: 0.43 },
    { name: 'Mục đích vay', value: 0.09 },
    { name: 'DTI 35%', value: -0.14 },
  ];

  fairnessData = [
    { attribute: 'Disparate Impact (Nam/Nữ)', value: 0.92, status: 'PASS' },
    { attribute: 'Equal Opportunity Diff', value: -0.03, status: 'PASS' },
    { attribute: 'Vùng địa lý (Thành thị/Nông thôn)', value: 0.78, status: 'WARNING' },
  ];

  regionData = [
    { name: 'Đông Bắc', rate: 64 },
    { name: 'Tây Nguyên', rate: 59 },
    { name: 'ĐB S.Hồng', rate: 71 },
    { name: 'Đông Nam', rate: 72 },
    { name: 'Tây Nam', rate: 65 },
  ];

  constructor(private mockData: MockDataService, public auth: AuthService, private mockSocket: MockSocketService) { }

  // Syncfusion Chart Settings
  public primaryXAxis = { valueType: 'Category' };
  public tooltipSettings = { enable: true };
  public legendSettings = { visible: true, position: 'Bottom' };
  public dataLabel = { visible: true, name: 'rating', position: 'Outside' };

  public volumeData = [
    { month: 'T9/25', volume: 1420 },
    { month: 'T10/25', volume: 1530 },
    { month: 'T11/25', volume: 1610 },
    { month: 'T12/25', volume: 1350 },
    { month: 'T1/26', volume: 1750 },
    { month: 'T2/26', volume: 1890 }
  ];

  public riskData = [
    { rating: 'Hạng A', count: 45, fill: '#059669' },
    { rating: 'Hạng B', count: 35, fill: '#2563EB' },
    { rating: 'Hạng C', count: 12, fill: '#D97706' },
    { rating: 'Hạng D', count: 8, fill: '#DC2626' }
  ];

  ngOnInit() {
    this.portfolio = this.mockData.getPortfolioSummary();
    this.recentLoans = this.mockData.getLoans().slice(0, 5);
    this.recentAlerts = this.mockData.getNotifications().slice(0, 4);
    this.topModels = this.mockData.getModels().filter(m => m.status !== 'ARCHIVED').slice(0, 4);
    this.unreadCount = this.recentAlerts.filter(n => !n.read).length;

    // Simulate real-time alerts
    this.mockSocket.getAlertStream().subscribe(alert => {
      this.recentAlerts.unshift({
        id: alert.id,
        title: 'System Event: ' + alert.type,
        message: alert.message,
        type: 'SYSTEM',
        severity: alert.type as 'INFO' | 'WARNING' | 'CRITICAL',
        timestamp: alert.time,
        read: false,
        actionUrl: '/monitoring'
      });
      if (this.recentAlerts.length > 5) this.recentAlerts.pop();
      this.unreadCount = this.recentAlerts.filter(n => !n.read).length;
    });
  }

  ngAfterViewInit() {
    this.initMap();
  }

  private initMap(): void {
    if (!document.getElementById('risk-map')) return;
    const map = L.map('risk-map').setView([16.0, 106.0], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    const markerIcon = L.divIcon({
      className: 'custom-map-marker',
      html: '<div style="background:var(--brand-danger);width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.3)"></div>'
    });

    this.portfolio.provinceRisk.forEach(p => {
      L.marker([p.lat, p.lng], { icon: markerIcon }).addTo(map)
        .bindPopup(`<b>${p.province}</b><br>NPL: ${p.npl}%<br>Dư nợ: ${(p.outstanding / 1000).toFixed(1)}B`);
    });
  }
}
