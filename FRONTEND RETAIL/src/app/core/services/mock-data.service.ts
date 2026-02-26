import { Injectable } from '@angular/core';
import {
  Customer, LoanApplication, AIModel, Notification, AutoMLJob,
  PortfolioSummary, FairnessMetric, EWSAlert, CreditScore,
  WorkflowTask, ComplianceReport, AdversarialAttack, DriftFeature,
  StressScenario, ModelLineageStep, AdminUser, SLAMetric
} from '../models/data.models';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  // ===================== CUSTOMERS =====================
  getCustomers(): Customer[] {
    return [
      {
        id: 'KH001', fullName: 'Nguyễn Thị Hồng', cccd: '001200012345', dateOfBirth: '1990-05-15', gender: 'F', phone: '0912345001', email: 'hong.nt@gmail.com', address: '123 Nguyễn Huệ, Q.1', province: 'TP.HCM', customerType: 'INDIVIDUAL', internalScore: 731, creditLimit: 500000000, totalOutstanding: 180000000, status: 'ACTIVE', cicScore: 720, ekycVerified: true, createdAt: '2024-01-15', documents: [
          { id: 'D001', name: 'CCCD mặt trước', type: 'CCCD', fileUrl: '/docs/cccd_front.pdf', uploadedAt: '2024-01-15', ocrExtracted: true },
          { id: 'D002', name: 'Sao kê lương T1-T6/2025', type: 'BANK_STATEMENT', fileUrl: '/docs/salary.pdf', uploadedAt: '2025-07-01', expiryDate: '2026-01-01', ocrExtracted: true },
        ]
      },
      { id: 'KH002', fullName: 'Trần Văn Bảo', cccd: '079200098765', dateOfBirth: '1985-11-20', gender: 'M', phone: '0923456002', email: 'bao.tv@gmail.com', address: '456 Lê Lợi, Q.5', province: 'TP.HCM', customerType: 'INDIVIDUAL', internalScore: 680, creditLimit: 300000000, totalOutstanding: 250000000, status: 'ACTIVE', cicScore: 660, ekycVerified: true, createdAt: '2023-06-10', documents: [] },
      { id: 'KH003', fullName: 'Phạm Minh Châu', cccd: '001199087654', dateOfBirth: '1992-03-08', gender: 'F', phone: '0934567003', email: 'chau.pm@gmail.com', address: '789 Hoàng Diệu, Ba Đình', province: 'Hà Nội', customerType: 'INDIVIDUAL', internalScore: 810, creditLimit: 1000000000, totalOutstanding: 0, status: 'ACTIVE', cicScore: 800, ekycVerified: true, createdAt: '2024-08-20', documents: [] },
      { id: 'KH004', fullName: 'Lê Đức Dũng', cccd: '048198076543', dateOfBirth: '1980-07-22', gender: 'M', phone: '0945678004', email: 'dung.ld@gmail.com', address: '321 Trần Phú, Hải Châu', province: 'Đà Nẵng', customerType: 'HOUSEHOLD', internalScore: 590, creditLimit: 200000000, totalOutstanding: 195000000, status: 'ACTIVE', cicScore: 580, ekycVerified: true, createdAt: '2022-12-01', documents: [] },
      { id: 'KH005', fullName: 'Võ Thị Em', cccd: '054199565432', dateOfBirth: '1995-01-10', gender: 'F', phone: '0956789005', email: 'em.vt@gmail.com', address: '654 Nguyễn Trãi, Ninh Kiều', province: 'Cần Thơ', customerType: 'INDIVIDUAL', internalScore: 720, creditLimit: 400000000, totalOutstanding: 120000000, status: 'ACTIVE', cicScore: 710, ekycVerified: true, createdAt: '2024-03-05', documents: [] },
      { id: 'KH006', fullName: 'Hoàng Văn Phú', cccd: '036198854321', dateOfBirth: '1988-09-30', gender: 'M', phone: '0967890006', email: 'phu.hv@gmail.com', address: '987 Lý Thường Kiệt, TP Thanh Hóa', province: 'Thanh Hóa', customerType: 'SME', internalScore: 650, creditLimit: 2000000000, totalOutstanding: 1500000000, status: 'ACTIVE', cicScore: 640, ekycVerified: true, createdAt: '2023-09-15', documents: [] },
      { id: 'KH007', fullName: 'Đặng Thị Giang', cccd: '001200143210', dateOfBirth: '2001-12-25', gender: 'F', phone: '0978901007', email: 'giang.dt@gmail.com', address: '147 Đội Cấn, Ba Đình', province: 'Hà Nội', customerType: 'INDIVIDUAL', internalScore: 450, creditLimit: 50000000, totalOutstanding: 48000000, status: 'ACTIVE', cicScore: 430, ekycVerified: false, createdAt: '2025-01-10', documents: [] },
      { id: 'KH008', fullName: 'Bùi Thanh Hải', cccd: '079197832109', dateOfBirth: '1978-04-18', gender: 'M', phone: '0989012008', email: 'hai.bt@gmail.com', address: '258 Nguyễn Văn Linh, Q.7', province: 'TP.HCM', customerType: 'SME', internalScore: 780, creditLimit: 5000000000, totalOutstanding: 3200000000, status: 'ACTIVE', cicScore: 770, ekycVerified: true, createdAt: '2021-05-20', documents: [] },
      { id: 'KH009', fullName: 'Ngô Minh Kha', cccd: '068199721098', dateOfBirth: '1997-06-14', gender: 'M', phone: '0990123009', email: 'kha.nm@gmail.com', address: '369 Hùng Vương, Vĩnh Trung', province: 'Đà Nẵng', customerType: 'INDIVIDUAL', internalScore: 550, creditLimit: 150000000, totalOutstanding: 145000000, status: 'ACTIVE', cicScore: 540, ekycVerified: true, createdAt: '2024-06-01', documents: [] },
      { id: 'KH010', fullName: 'Mai Thùy Linh', cccd: '001199510987', dateOfBirth: '1995-08-08', gender: 'F', phone: '0901234010', email: 'linh.mt@gmail.com', address: '741 Cầu Giấy, Hà Nội', province: 'Hà Nội', customerType: 'INDIVIDUAL', internalScore: 850, creditLimit: 2000000000, totalOutstanding: 500000000, status: 'ACTIVE', cicScore: 840, ekycVerified: true, createdAt: '2023-02-14', documents: [] },
    ];
  }

  // ===================== LOANS =====================
  getLoans(): LoanApplication[] {
    return [
      {
        id: 'LV-2435', customerId: 'KH001', customerName: 'Nguyễn Thị Hồng', productType: 'CONSUMER',
        amount: 350000000, term: 36, interestRate: 9.5, purpose: 'Mua xe ô tô',
        status: 'REVIEWING', dti: 35, assignedAnalyst: 'Nguyễn Văn An', assignedOfficer: 'Trần Thị Bình',
        aiScore: this.generateCreditScore(731, 'GOOD', 'APPROVE'),
        preScreenResult: { status: 'PASS', cicCheck: true, blacklistCheck: true, basicConditionCheck: true, details: ['CIC: Lịch sử tốt', 'Không trong danh sách đen', 'Đủ điều kiện thu nhập'], timestamp: '2026-02-23T08:15:00' },
        createdAt: '2026-02-22T14:30:00', updatedAt: '2026-02-23T09:41:00',
        timeline: [
          { action: 'Tạo hồ sơ', actor: 'Nguyễn Văn An', timestamp: '2026-02-22T14:30:00', status: 'SUBMITTED' },
          { action: 'Pre-screening PASS', actor: 'Hệ thống', timestamp: '2026-02-22T14:31:00', status: 'PRE_SCREENING' },
          { action: 'AI Scoring hoàn tất - 731 điểm', actor: 'AI Engine', timestamp: '2026-02-22T14:33:00', status: 'AI_SCORING' },
          { action: 'Chuyển thẩm định', actor: 'Hệ thống', timestamp: '2026-02-22T14:33:00', status: 'REVIEWING' },
        ]
      },
      {
        id: 'LV-2436', customerId: 'KH003', customerName: 'Phạm Minh Châu', productType: 'MORTGAGE',
        amount: 2500000000, term: 240, interestRate: 8.2, purpose: 'Mua căn hộ Vinhomes Grand Park',
        status: 'APPROVED', dti: 28, ltv: 70, collateralValue: 3500000000, collateralType: 'Bất động sản',
        assignedAnalyst: 'Nguyễn Văn An', assignedOfficer: 'Trần Thị Bình',
        aiScore: this.generateCreditScore(810, 'EXCELLENT', 'APPROVE'),
        preScreenResult: { status: 'PASS', cicCheck: true, blacklistCheck: true, basicConditionCheck: true, details: [], timestamp: '2026-02-20T10:00:00' },
        createdAt: '2026-02-19T09:00:00', updatedAt: '2026-02-21T16:00:00',
        timeline: [
          { action: 'Tạo hồ sơ', actor: 'Nguyễn Văn An', timestamp: '2026-02-19T09:00:00', status: 'SUBMITTED' },
          { action: 'AI Scoring hoàn tất - 810 điểm', actor: 'AI Engine', timestamp: '2026-02-19T09:05:00', status: 'AI_SCORING' },
          { action: 'Phê duyệt bởi Trưởng phòng', actor: 'Lê Minh Cường', timestamp: '2026-02-21T16:00:00', status: 'APPROVED', details: 'Hồ sơ tốt, TSĐB đủ giá trị' },
        ]
      },
      {
        id: 'LV-2437', customerId: 'KH004', customerName: 'Lê Đức Dũng', productType: 'BUSINESS',
        amount: 800000000, term: 60, interestRate: 10.5, purpose: 'Mở rộng cửa hàng kinh doanh',
        status: 'REJECTED', dti: 55, assignedAnalyst: 'Nguyễn Văn An',
        aiScore: this.generateCreditScore(480, 'POOR', 'REJECT'),
        preScreenResult: { status: 'CONDITIONAL', cicCheck: true, blacklistCheck: true, basicConditionCheck: false, details: ['DTI vượt ngưỡng 40%'], timestamp: '2026-02-18T11:00:00' },
        createdAt: '2026-02-18T10:00:00', updatedAt: '2026-02-20T14:00:00',
        timeline: [
          { action: 'Tạo hồ sơ', actor: 'Nguyễn Văn An', timestamp: '2026-02-18T10:00:00', status: 'SUBMITTED' },
          { action: 'Từ chối - DTI quá cao, điểm AI thấp', actor: 'Trần Thị Bình', timestamp: '2026-02-20T14:00:00', status: 'REJECTED' },
        ]
      },
      {
        id: 'LV-2438', customerId: 'KH005', customerName: 'Võ Thị Em', productType: 'CONSUMER',
        amount: 150000000, term: 24, interestRate: 11.0, purpose: 'Du học',
        status: 'AI_SCORING', dti: 30, assignedAnalyst: 'Nguyễn Văn An',
        preScreenResult: { status: 'PASS', cicCheck: true, blacklistCheck: true, basicConditionCheck: true, details: [], timestamp: '2026-02-24T09:00:00' },
        createdAt: '2026-02-24T08:30:00', updatedAt: '2026-02-24T09:01:00',
        timeline: [
          { action: 'Tạo hồ sơ', actor: 'Nguyễn Văn An', timestamp: '2026-02-24T08:30:00', status: 'SUBMITTED' },
          { action: 'AI Scoring đang xử lý...', actor: 'AI Engine', timestamp: '2026-02-24T09:01:00', status: 'AI_SCORING' },
        ]
      },
      {
        id: 'LV-2439', customerId: 'KH008', customerName: 'Bùi Thanh Hải', productType: 'BUSINESS',
        amount: 5000000000, term: 84, interestRate: 9.0, purpose: 'Xây dựng nhà xưởng',
        status: 'CONDITIONALLY_APPROVED', dti: 32, ltv: 65, collateralValue: 7500000000, collateralType: 'Nhà xưởng',
        assignedAnalyst: 'Nguyễn Văn An', assignedOfficer: 'Trần Thị Bình',
        aiScore: this.generateCreditScore(780, 'GOOD', 'CONDITIONAL'),
        createdAt: '2026-02-15T10:00:00', updatedAt: '2026-02-22T11:00:00',
        preScreenResult: { status: 'PASS', cicCheck: true, blacklistCheck: true, basicConditionCheck: true, details: [], timestamp: '2026-02-15T10:05:00' },
        timeline: []
      },
      {
        id: 'LV-2440', customerId: 'KH010', customerName: 'Mai Thùy Linh', productType: 'CREDIT_CARD',
        amount: 200000000, term: 0, interestRate: 18.0, purpose: 'Thẻ tín dụng hạng Platinum',
        status: 'DISBURSED', dti: 15, assignedAnalyst: 'Nguyễn Văn An',
        aiScore: this.generateCreditScore(850, 'EXCELLENT', 'APPROVE'),
        preScreenResult: { status: 'PASS', cicCheck: true, blacklistCheck: true, basicConditionCheck: true, details: [], timestamp: '2026-02-10T08:00:00' },
        createdAt: '2026-02-10T07:30:00', updatedAt: '2026-02-12T09:00:00',
        timeline: []
      },
      {
        id: 'LV-2441', customerId: 'KH002', customerName: 'Trần Văn Bảo', productType: 'CONSUMER',
        amount: 100000000, term: 12, interestRate: 12.0, purpose: 'Sửa chữa nhà',
        status: 'SUBMITTED', dti: 42, assignedAnalyst: 'Nguyễn Văn An',
        createdAt: '2026-02-25T07:00:00', updatedAt: '2026-02-25T07:00:00',
        preScreenResult: undefined,
        timeline: [
          { action: 'Tạo hồ sơ', actor: 'Nguyễn Văn An', timestamp: '2026-02-25T07:00:00', status: 'SUBMITTED' },
        ]
      },
      {
        id: 'LV-2442', customerId: 'KH006', customerName: 'Hoàng Văn Phú', productType: 'BUSINESS',
        amount: 3000000000, term: 48, interestRate: 9.8, purpose: 'Nhập hàng nguyên liệu',
        status: 'REVIEWING', dti: 38, assignedAnalyst: 'Nguyễn Văn An', assignedOfficer: 'Trần Thị Bình',
        aiScore: this.generateCreditScore(650, 'AVERAGE', 'CONDITIONAL'),
        preScreenResult: { status: 'PASS', cicCheck: true, blacklistCheck: true, basicConditionCheck: true, details: [], timestamp: '2026-02-21T14:00:00' },
        createdAt: '2026-02-21T13:00:00', updatedAt: '2026-02-23T10:00:00',
        timeline: []
      },
    ];
  }

  // ===================== AI MODELS =====================
  getModels(): AIModel[] {
    return [
      { id: 'M001', name: 'Credit Risk Model', version: 'v3.2.1', platform: 'H2O', type: 'CREDIT_RISK', status: 'PRODUCTION', metrics: { auc: 0.891, precision: 0.86, recall: 0.82, f1: 0.84, ks: 0.72, gini: 0.78, psi: 0.05 }, deployedAt: '2026-01-15', createdBy: 'Hoàng Đức Em', tags: ['champion', 'seldon'] },
      { id: 'M002', name: 'Credit Risk Model', version: 'v3.1.0', platform: 'H2O', type: 'CREDIT_RISK', status: 'STAGING', metrics: { auc: 0.812, precision: 0.80, recall: 0.78, f1: 0.79, ks: 0.68, gini: 0.72, psi: 0.08 }, createdBy: 'Hoàng Đức Em', tags: ['challenger'] },
      { id: 'M003', name: 'Fraud Detection XGB', version: 'v2.0.0', platform: 'Custom', type: 'FRAUD', status: 'PRODUCTION', metrics: { auc: 0.945, precision: 0.92, recall: 0.88, f1: 0.90, ks: 0.85, gini: 0.89 }, deployedAt: '2025-12-01', createdBy: 'Hoàng Đức Em', tags: ['sagemaker'] },
      { id: 'M004', name: 'Behavioral Scoring', version: 'v1.5.0', platform: 'AutoAI', type: 'BEHAVIORAL', status: 'PRODUCTION', metrics: { auc: 0.823, precision: 0.79, recall: 0.76, f1: 0.77, ks: 0.65, gini: 0.70 }, deployedAt: '2026-01-20', createdBy: 'Hoàng Đức Em', tags: ['kubeflow'] },
      { id: 'M005', name: 'Customer Segmentation', version: 'v1.2.0', platform: 'Watson', type: 'SEGMENTATION', status: 'PRODUCTION', metrics: { auc: 0.780, precision: 0.75, recall: 0.73, f1: 0.74, ks: 0.60, gini: 0.62 }, deployedAt: '2025-11-15', createdBy: 'Hoàng Đức Em', tags: ['predictionio'] },
      { id: 'M006', name: 'Credit Risk Deep Learning', version: 'v0.1.0', platform: 'Custom', type: 'CREDIT_RISK', status: 'DEVELOPMENT', metrics: { auc: 0.870, precision: 0.83, recall: 0.80, f1: 0.81, ks: 0.70, gini: 0.75 }, createdBy: 'Hoàng Đức Em', tags: ['experimental'] },
      { id: 'M007', name: 'Legacy Scorecard', version: 'v1.0.0', platform: 'Custom', type: 'CREDIT_RISK', status: 'ARCHIVED', metrics: { auc: 0.750, precision: 0.72, recall: 0.70, f1: 0.71, ks: 0.55, gini: 0.58 }, createdBy: 'System', tags: ['deprecated'] },
    ];
  }

  // ===================== AUTOML JOBS =====================
  getAutoMLJobs(): AutoMLJob[] {
    return [
      { id: 'J001', name: 'Credit Risk Retrain Q1/2026', platform: 'H2O', status: 'RUNNING', progress: 80, modelsGenerated: 17, startedAt: '2026-02-25T06:00:00', datasetName: 'credit_data_2025_q4.csv' },
      { id: 'J002', name: 'Fraud Detection Update', platform: 'AutoAI', status: 'COMPLETED', progress: 100, bestModelAUC: 0.952, modelsGenerated: 25, startedAt: '2026-02-20T10:00:00', completedAt: '2026-02-20T16:30:00', datasetName: 'fraud_transactions_2025.csv' },
      { id: 'J003', name: 'Behavioral Scoring v2', platform: 'Watson', status: 'QUEUED', progress: 0, modelsGenerated: 0, startedAt: '2026-02-25T08:00:00', datasetName: 'behavioral_features.parquet' },
      { id: 'J004', name: 'Segment Model Retrain', platform: 'H2O', status: 'FAILED', progress: 45, modelsGenerated: 8, startedAt: '2026-02-24T14:00:00', datasetName: 'customer_segments.csv' },
    ];
  }

  // ===================== FAIRNESS =====================
  getFairnessMetrics(): FairnessMetric[] {
    return [
      { protectedAttribute: 'Giới tính (Nam/Nữ)', disparateImpact: 0.92, statisticalParityDiff: -0.04, equalOpportunityDiff: -0.03, averageOddsDiff: -0.02, status: 'PASS' },
      { protectedAttribute: 'Độ tuổi (<30 / ≥30)', disparateImpact: 0.85, statisticalParityDiff: -0.08, equalOpportunityDiff: -0.06, averageOddsDiff: -0.05, status: 'PASS' },
      { protectedAttribute: 'Vùng địa lý (Thành thị/Nông thôn)', disparateImpact: 0.78, statisticalParityDiff: -0.12, equalOpportunityDiff: -0.09, averageOddsDiff: -0.07, status: 'WARNING' },
      { protectedAttribute: 'Tỉnh thành (Bắc/Trung/Nam)', disparateImpact: 0.88, statisticalParityDiff: -0.06, equalOpportunityDiff: -0.04, averageOddsDiff: -0.03, status: 'PASS' },
    ];
  }

  // ===================== NOTIFICATIONS =====================
  getNotifications(): Notification[] {
    return [
      { id: 'N001', type: 'EWS', severity: 'CRITICAL', title: 'EWS: Khách hàng VP259', message: 'Thanh toán chậm 5 ngày liên tục, rủi ro chuyển nhóm nợ 2', read: false, timestamp: '2026-02-25T09:30:00', actionUrl: '/customers/KH009' },
      { id: 'N002', type: 'MODEL', severity: 'WARNING', title: 'Model drift detected', message: 'PSI=0.27 cho Credit Scoring model v3.2.1, vượt ngưỡng 0.2', read: false, timestamp: '2026-02-25T08:15:00', actionUrl: '/model-registry/M001' },
      { id: 'N003', type: 'LOAN', severity: 'WARNING', title: 'SLA sắp hết hạn', message: 'Hồ sơ LV-2442 cần phê duyệt trong 2.4 giờ', read: false, timestamp: '2026-02-25T09:00:00', actionUrl: '/loans/LV-2442' },
      { id: 'N004', type: 'COMPLIANCE', severity: 'INFO', title: 'Fairness alert', message: 'Tỷ lệ duyệt vay Đà Nẵng 61%, thấp hơn trung bình 7%', read: false, timestamp: '2026-02-25T07:45:00', actionUrl: '/fairness' },
      { id: 'N005', type: 'SYSTEM', severity: 'INFO', title: 'AutoML Job hoàn tất', message: 'Job Fraud Detection Update đã hoàn tất, best AUC: 0.952', read: true, timestamp: '2026-02-20T16:30:00', actionUrl: '/automl' },
      { id: 'N006', type: 'LOAN', severity: 'INFO', title: 'Hồ sơ được phê duyệt', message: 'Hồ sơ LV-2436 đã được phê duyệt bởi Trưởng phòng', read: true, timestamp: '2026-02-21T16:00:00', actionUrl: '/loans/LV-2436' },
    ];
  }

  // ===================== EWS ALERTS =====================
  getEWSAlerts(): EWSAlert[] {
    return [
      { id: 'EWS001', customerId: 'KH009', customerName: 'Ngô Minh Kha', loanId: 'LV-2200', riskLevel: 'HIGH', signals: ['Chậm thanh toán 5 ngày', 'Giảm doanh số 30%', 'Nợ quá hạn nhóm 1'], ewsScore: 78, detectedAt: '2026-02-25T09:30:00', status: 'NEW' },
      { id: 'EWS002', customerId: 'KH004', customerName: 'Lê Đức Dũng', loanId: 'LV-2100', riskLevel: 'HIGH', signals: ['DTI tăng lên 55%', 'Thu nhập giảm 20%'], ewsScore: 72, detectedAt: '2026-02-24T14:00:00', status: 'ACKNOWLEDGED' },
      { id: 'EWS003', customerId: 'KH007', customerName: 'Đặng Thị Giang', loanId: 'LV-2300', riskLevel: 'MEDIUM', signals: ['Chậm thanh toán 2 ngày', 'Hạn mức sử dụng 96%'], ewsScore: 55, detectedAt: '2026-02-24T10:00:00', status: 'NEW' },
      { id: 'EWS004', customerId: 'KH002', customerName: 'Trần Văn Bảo', loanId: 'LV-2150', riskLevel: 'MEDIUM', signals: ['Thanh toán không đều', 'Thay đổi địa chỉ liên lạc'], ewsScore: 48, detectedAt: '2026-02-23T16:00:00', status: 'RESOLVED' },
    ];
  }

  // ===================== PORTFOLIO =====================
  getPortfolioSummary(): PortfolioSummary {
    return {
      totalOutstanding: 14280, // tỷ VND
      nplRatio: 2.16,
      approvalRate: 68.5,
      overrideRate: 7.2,
      avgProcessingTime: 4.2, // hours
      eclStage1: 124.3,
      eclStage2: 67.8,
      eclStage3: 42.5,
      ratingDistribution: [
        { rating: 'AAA', count: 1250, amount: 3200 },
        { rating: 'AA', count: 2100, amount: 4500 },
        { rating: 'A', count: 1800, amount: 3100 },
        { rating: 'BBB', count: 1200, amount: 2000 },
        { rating: 'BB', count: 600, amount: 800 },
        { rating: 'B', count: 300, amount: 450 },
        { rating: 'CCC', count: 120, amount: 150 },
        { rating: 'D', count: 50, amount: 80 },
      ],
      provinceRisk: [
        { province: 'TP.HCM', npl: 1.8, outstanding: 4500, lat: 10.8231, lng: 106.6297 },
        { province: 'Hà Nội', npl: 2.1, outstanding: 3800, lat: 21.0285, lng: 105.8542 },
        { province: 'Đà Nẵng', npl: 2.5, outstanding: 1200, lat: 16.0544, lng: 108.2022 },
        { province: 'Cần Thơ', npl: 3.1, outstanding: 800, lat: 10.0452, lng: 105.7469 },
        { province: 'Hải Phòng', npl: 1.9, outstanding: 950, lat: 20.8449, lng: 106.6881 },
        { province: 'Thanh Hóa', npl: 3.5, outstanding: 600, lat: 19.8067, lng: 105.7852 },
        { province: 'Bình Dương', npl: 1.5, outstanding: 1100, lat: 11.1271, lng: 106.6511 },
        { province: 'Đồng Nai', npl: 2.0, outstanding: 700, lat: 10.9450, lng: 106.8240 },
      ]
    };
  }

  // ===================== HELPERS =====================
  private generateCreditScore(total: number, rating: any, recommendation: any): CreditScore {
    return {
      totalScore: total,
      rating,
      recommendation,
      modelVersion: 'v3.2.1',
      scoredAt: '2026-02-23T09:41:00',
      dimensions: [
        { name: 'Thu nhập', score: 0.72, weight: 0.25 },
        { name: 'Tài sản', score: 0.65, weight: 0.15 },
        { name: 'Lịch sử tín dụng', score: 0.80, weight: 0.25 },
        { name: 'Hành vi', score: 0.58, weight: 0.15 },
        { name: 'Mục đích vay', score: 0.70, weight: 0.10 },
        { name: 'Thị trường', score: 0.62, weight: 0.10 },
      ],
      components: [
        { name: 'Behavioral Scoring', source: 'seldon', protocol: 'gRPC', score: 720, latency: 85, status: 'SUCCESS' },
        { name: 'Credit Risk Model', source: 'kubeflow', protocol: 'gRPC', score: 745, latency: 120, status: 'SUCCESS' },
        { name: 'Fraud Detection', source: 'sagemaker', protocol: 'REST', score: 890, latency: 350, status: 'SUCCESS' },
        { name: 'Customer Segment', source: 'predictionio', protocol: 'REST', score: 680, latency: 200, status: 'SUCCESS' },
      ]
    };
  }

  // ===================== WORKFLOW TASKS =====================
  getWorkflowTasks(): WorkflowTask[] {
    return [
      { id: 'WF001', loanId: 'LV-2441', customerName: 'Trần Văn Bảo', taskType: 'PRE_SCREEN', status: 'PENDING', assignee: 'Nguyễn Văn An', priority: 'MEDIUM', slaDeadline: '2026-02-25T12:00:00', createdAt: '2026-02-25T07:00:00', amount: 100000000 },
      { id: 'WF002', loanId: 'LV-2435', customerName: 'Nguyễn Thị Hồng', taskType: 'APPROVAL', status: 'IN_PROGRESS', assignee: 'Trần Thị Bình', priority: 'HIGH', slaDeadline: '2026-02-25T14:00:00', createdAt: '2026-02-23T09:41:00', amount: 350000000 },
      { id: 'WF003', loanId: 'LV-2442', customerName: 'Hoàng Văn Phú', taskType: 'APPRAISAL', status: 'IN_PROGRESS', assignee: 'Trần Thị Bình', priority: 'HIGH', slaDeadline: '2026-02-25T16:00:00', createdAt: '2026-02-23T10:00:00', amount: 3000000000 },
      { id: 'WF004', loanId: 'LV-2438', customerName: 'Võ Thị Em', taskType: 'AI_SCORING', status: 'IN_PROGRESS', assignee: 'AI Engine', priority: 'MEDIUM', slaDeadline: '2026-02-24T10:00:00', createdAt: '2026-02-24T09:01:00', amount: 150000000 },
      { id: 'WF005', loanId: 'LV-2436', customerName: 'Phạm Minh Châu', taskType: 'DISBURSEMENT', status: 'COMPLETED', assignee: 'Nguyễn Văn An', priority: 'LOW', slaDeadline: '2026-02-22T17:00:00', createdAt: '2026-02-21T16:00:00', amount: 2500000000 },
      { id: 'WF006', loanId: 'LV-2437', customerName: 'Lê Đức Dũng', taskType: 'APPROVAL', status: 'REJECTED', assignee: 'Trần Thị Bình', priority: 'LOW', slaDeadline: '2026-02-20T17:00:00', createdAt: '2026-02-20T14:00:00', amount: 800000000 },
    ];
  }

  // ===================== COMPLIANCE REPORTS =====================
  getComplianceReports(): ComplianceReport[] {
    return [
      { id: 'CR001', name: 'Báo cáo hoạt động tín dụng T02/2026', type: 'BC001', period: '02/2026', format: 'Both', status: 'Ready', generatedAt: '2026-02-25T06:00:00', size: '2.4MB' },
      { id: 'CR002', name: 'Model Card - XGBoost Credit Risk v3.2.1', type: 'BC002', period: 'Q1/2026', format: 'PDF', status: 'Ready', generatedAt: '2026-01-31T12:00:00', size: '1.8MB' },
      { id: 'CR003', name: 'IFRS 9 ECL Report Q4/2025', type: 'BC003', period: 'Q4/2025', format: 'Excel', status: 'Ready', generatedAt: '2026-01-15T10:00:00', size: '8.1MB' },
      { id: 'CR004', name: 'Báo cáo tuân thủ AI 2025', type: 'BC004', period: '2025', format: 'PDF', status: 'Ready', generatedAt: '2026-01-31T12:00:00', size: '12.3MB' },
      { id: 'CR005', name: 'SBV Report - Circular 02', type: 'BC005', period: '02/2026', format: 'PDF', status: 'Draft', generatedAt: '2026-02-25T08:00:00', size: '—' },
    ];
  }

  // ===================== ADVERSARIAL ATTACKS =====================
  getAdversarialAttacks(): AdversarialAttack[] {
    return [
      { id: 'ATK001', timestamp: '2026-02-25T09:45:00', attackType: 'FGSM', targetModel: 'Credit Risk Model', severity: 'HIGH', epsilon: 0.1, blocked: true, sourceIP: '203.0.113.42' },
      { id: 'ATK002', timestamp: '2026-02-25T08:30:00', attackType: 'PGD', targetModel: 'Fraud Detection', severity: 'MEDIUM', epsilon: 0.05, blocked: true, sourceIP: '198.51.100.15' },
      { id: 'ATK003', timestamp: '2026-02-24T22:15:00', attackType: 'C&W', targetModel: 'Behavioral Score', severity: 'HIGH', epsilon: 0.03, blocked: true, sourceIP: '192.0.2.88' },
      { id: 'ATK004', timestamp: '2026-02-24T18:00:00', attackType: 'DeepFool', targetModel: 'Credit Risk Model', severity: 'LOW', epsilon: 0.15, blocked: true, sourceIP: '10.0.1.99' },
      { id: 'ATK005', timestamp: '2026-02-24T14:30:00', attackType: 'FGSM', targetModel: 'Segment Model', severity: 'MEDIUM', epsilon: 0.08, blocked: false, sourceIP: '203.0.113.42' },
    ];
  }

  // ===================== DRIFT FEATURES =====================
  getDriftFeatures(): DriftFeature[] {
    return [
      { name: 'Monthly Income', psi: 0.25, klDivergence: 0.18, jsDistance: 0.12, status: 'DRIFT' },
      { name: 'Outstanding Balance', psi: 0.15, klDivergence: 0.10, jsDistance: 0.07, status: 'WATCH' },
      { name: 'Payment History', psi: 0.06, klDivergence: 0.04, jsDistance: 0.03, status: 'STABLE' },
      { name: 'Employment Duration', psi: 0.03, klDivergence: 0.02, jsDistance: 0.01, status: 'STABLE' },
      { name: 'Number of Inquiries', psi: 0.22, klDivergence: 0.16, jsDistance: 0.11, status: 'DRIFT' },
      { name: 'DTI Ratio', psi: 0.09, klDivergence: 0.06, jsDistance: 0.04, status: 'STABLE' },
    ];
  }

  // ===================== STRESS SCENARIOS =====================
  getStressScenarios(): StressScenario[] {
    return [
      { name: 'Baseline', gdpGrowth: '+6.5%', interestRate: '6.0%', unemployment: '2.5%', nplRate: 1.8, expectedLoss: '230B', car: 12.5, status: 'PASS' },
      { name: 'Mild', gdpGrowth: '+4.0%', interestRate: '7.5%', unemployment: '3.5%', nplRate: 2.8, expectedLoss: '360B', car: 11.2, status: 'PASS' },
      { name: 'Moderate', gdpGrowth: '+1.5%', interestRate: '9.0%', unemployment: '5.0%', nplRate: 4.5, expectedLoss: '580B', car: 9.1, status: 'PASS' },
      { name: 'Severe', gdpGrowth: '-1.0%', interestRate: '11.0%', unemployment: '7.0%', nplRate: 7.2, expectedLoss: '920B', car: 7.8, status: 'FAIL' },
      { name: 'Extreme', gdpGrowth: '-3.5%', interestRate: '13.0%', unemployment: '9.5%', nplRate: 11.5, expectedLoss: '1,480B', car: 5.2, status: 'FAIL' },
    ];
  }

  // ===================== MODEL LINEAGE =====================
  getModelLineage(modelId: string): ModelLineageStep[] {
    return [
      { step: 'Data Collection', timestamp: '2025-10-01', actor: 'ds_nguyen', details: 'Collected 125K samples from PostgreSQL + MinIO', status: 'COMPLETED' },
      { step: 'Feature Engineering', timestamp: '2025-10-15', actor: 'ds_nguyen', details: 'Kubeflow Pipeline: 42 features extracted, feature store updated', status: 'COMPLETED' },
      { step: 'Training (H2O AutoML)', timestamp: '2025-11-01', actor: 'H2O.ai', details: 'AutoML job: 25 models trained, XGBoost selected (AUC 0.891)', status: 'COMPLETED' },
      { step: 'Validation & Fairness', timestamp: '2025-11-15', actor: 'ds_nguyen', details: 'AIF360: DI=0.92 PASS, AIX360: SHAP explanations generated', status: 'COMPLETED' },
      { step: 'Model Registry', timestamp: '2025-12-01', actor: 'ModelDB', details: 'Registered as v3.2.1 in ModelDB with full lineage metadata', status: 'COMPLETED' },
      { step: 'Staging Deploy', timestamp: '2025-12-15', actor: 'ds_nguyen', details: 'Deployed to Seldon Core staging, canary 10%', status: 'COMPLETED' },
      { step: 'A/B Testing', timestamp: '2026-01-01', actor: 'system', details: 'Champion-Challenger: v3.2.1 vs v3.1.0, 2-week test', status: 'COMPLETED' },
      { step: 'Production Deploy', timestamp: '2026-01-15', actor: 'risk_mgr', details: 'Approved by Risk Manager, deployed to Seldon Core production', status: 'COMPLETED' },
      { step: 'Monitoring (Live)', timestamp: '2026-02-25', actor: 'Prometheus', details: 'PSI=0.08, AUC=0.891, latency p99=85ms, Grafana dashboard active', status: 'CURRENT' },
    ];
  }

  // ===================== ADMIN USERS =====================
  getAdminUsers(): AdminUser[] {
    return [
      { id: 'U001', username: 'analyst_an', fullName: 'Nguyễn Văn An', role: 'CREDIT_ANALYST', department: 'Phòng Phân tích', email: 'an.nv@bank.vn', isActive: true, lastLogin: '2026-02-25T09:00:00' },
      { id: 'U002', username: 'officer_binh', fullName: 'Trần Thị Bình', role: 'CREDIT_OFFICER', department: 'Phòng Tín dụng', email: 'binh.tt@bank.vn', isActive: true, lastLogin: '2026-02-25T08:30:00' },
      { id: 'U003', username: 'manager_cuong', fullName: 'Lê Minh Cường', role: 'CREDIT_MANAGER', department: 'Phòng Tín dụng', email: 'cuong.lm@bank.vn', isActive: true, lastLogin: '2026-02-24T16:00:00' },
      { id: 'U004', username: 'risk_mgr', fullName: 'Phạm Thanh Dương', role: 'RISK_MANAGER', department: 'Phòng Quản lý Rủi ro', email: 'duong.pt@bank.vn', isActive: true, lastLogin: '2026-02-25T07:45:00' },
      { id: 'U005', username: 'ds_nguyen', fullName: 'Hoàng Đức Em', role: 'DATA_SCIENTIST', department: 'Phòng Data Science', email: 'em.hd@bank.vn', isActive: true, lastLogin: '2026-02-25T06:00:00' },
      { id: 'U006', username: 'compliance_01', fullName: 'Võ Thị Fương', role: 'COMPLIANCE_OFFICER', department: 'Phòng Tuân thủ', email: 'fuong.vt@bank.vn', isActive: true, lastLogin: '2026-02-24T14:00:00' },
      { id: 'U007', username: 'admin', fullName: 'System Admin', role: 'SYSTEM_ADMIN', department: 'IT', email: 'admin@bank.vn', isActive: true, lastLogin: '2026-02-25T09:45:00' },
      { id: 'U008', username: 'cs_giang', fullName: 'Đặng Thị Giang', role: 'CUSTOMER_SERVICE', department: 'Phòng CSKH', email: 'giang.dt@bank.vn', isActive: false, lastLogin: '2026-02-20T10:00:00' },
    ];
  }

  // ===================== SLA METRICS =====================
  getSLAMetrics(): SLAMetric[] {
    return [
      { stage: 'Tiếp nhận → Pre-screening', targetHours: 0.5, actualHours: 0.3, onTimeRate: 98.5, totalProcessed: 1240 },
      { stage: 'Pre-screening → AI Scoring', targetHours: 0.25, actualHours: 0.1, onTimeRate: 99.8, totalProcessed: 1215 },
      { stage: 'AI Scoring → Thẩm định', targetHours: 2.0, actualHours: 1.8, onTimeRate: 92.3, totalProcessed: 1200 },
      { stage: 'Thẩm định → Phê duyệt', targetHours: 4.0, actualHours: 3.5, onTimeRate: 88.7, totalProcessed: 1180 },
      { stage: 'Phê duyệt → Giải ngân', targetHours: 24.0, actualHours: 18.5, onTimeRate: 95.1, totalProcessed: 850 },
    ];
  }
}
