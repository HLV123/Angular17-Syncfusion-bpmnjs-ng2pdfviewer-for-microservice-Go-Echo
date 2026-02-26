// ============================================================
// CORE DATA MODELS - Retail Platform CDSS
// ============================================================

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: Date;
}

export type UserRole =
  | 'CREDIT_ANALYST'
  | 'CREDIT_OFFICER'
  | 'CREDIT_MANAGER'
  | 'RISK_MANAGER'
  | 'DATA_SCIENTIST'
  | 'COMPLIANCE_OFFICER'
  | 'SYSTEM_ADMIN'
  | 'CUSTOMER_SERVICE';

export interface Customer {
  id: string;
  fullName: string;
  cccd: string;
  dateOfBirth: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  address: string;
  province: string;
  customerType: 'INDIVIDUAL' | 'HOUSEHOLD' | 'SME';
  internalScore: number;
  creditLimit: number;
  totalOutstanding: number;
  status: 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED';
  cicScore?: number;
  ekycVerified: boolean;
  createdAt: string;
  documents: CustomerDocument[];
}

export interface CustomerDocument {
  id: string;
  name: string;
  type: 'CCCD' | 'BANK_STATEMENT' | 'INCOME_PROOF' | 'PROPERTY' | 'CONTRACT' | 'OTHER';
  fileUrl: string;
  uploadedAt: string;
  expiryDate?: string;
  ocrExtracted: boolean;
}

export interface LoanApplication {
  id: string;
  customerId: string;
  customerName: string;
  productType: LoanProductType;
  amount: number;
  term: number; // months
  interestRate: number;
  purpose: string;
  status: LoanStatus;
  dti: number;
  ltv?: number;
  collateralValue?: number;
  collateralType?: string;
  assignedAnalyst?: string;
  assignedOfficer?: string;
  aiScore?: CreditScore;
  preScreenResult?: PreScreenResult;
  createdAt: string;
  updatedAt: string;
  timeline: LoanTimelineEntry[];
}

export type LoanProductType = 'CONSUMER' | 'MORTGAGE' | 'BUSINESS' | 'CREDIT_CARD';
export type LoanStatus = 'DRAFT' | 'SUBMITTED' | 'PRE_SCREENING' | 'AI_SCORING' | 'REVIEWING' | 'APPROVED' | 'CONDITIONALLY_APPROVED' | 'REJECTED' | 'DISBURSED';

export interface PreScreenResult {
  status: 'PASS' | 'CONDITIONAL' | 'REJECT';
  cicCheck: boolean;
  blacklistCheck: boolean;
  basicConditionCheck: boolean;
  details: string[];
  timestamp: string;
}

export interface CreditScore {
  totalScore: number; // 0-1000
  rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR' | 'HIGH_RISK';
  recommendation: 'APPROVE' | 'CONDITIONAL' | 'REJECT';
  dimensions: ScoreDimension[];
  modelVersion: string;
  scoredAt: string;
  components: ScoringComponent[];
}

export interface ScoreDimension {
  name: string;
  score: number;
  weight: number;
}

export interface ScoringComponent {
  name: string;
  source: string; // 'seldon' | 'kubeflow' | 'sagemaker' | 'predictionio'
  protocol: 'gRPC' | 'REST';
  score: number;
  latency: number; // ms
  status: 'SUCCESS' | 'FAILED' | 'TIMEOUT';
}

export interface LoanTimelineEntry {
  action: string;
  actor: string;
  timestamp: string;
  details?: string;
  status?: LoanStatus;
}

export interface AIModel {
  id: string;
  name: string;
  version: string;
  platform: 'H2O' | 'AutoAI' | 'Watson' | 'Custom';
  type: 'CREDIT_RISK' | 'FRAUD' | 'BEHAVIORAL' | 'SEGMENTATION';
  status: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION' | 'ARCHIVED';
  metrics: ModelMetrics;
  deployedAt?: string;
  createdBy: string;
  tags: string[];
}

export interface ModelMetrics {
  auc: number;
  precision: number;
  recall: number;
  f1: number;
  ks: number;
  gini: number;
  psi?: number;
}

export interface FairnessMetric {
  protectedAttribute: string;
  disparateImpact: number;
  statisticalParityDiff: number;
  equalOpportunityDiff: number;
  averageOddsDiff: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
}

export interface Notification {
  id: string;
  type: 'LOAN' | 'MODEL' | 'SYSTEM' | 'COMPLIANCE' | 'EWS';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

export interface AutoMLJob {
  id: string;
  name: string;
  platform: 'H2O' | 'AutoAI' | 'Watson';
  status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  bestModelAUC?: number;
  modelsGenerated: number;
  startedAt: string;
  completedAt?: string;
  datasetName: string;
}

export interface PortfolioSummary {
  totalOutstanding: number;
  nplRatio: number;
  approvalRate: number;
  overrideRate: number;
  avgProcessingTime: number;
  eclStage1: number;
  eclStage2: number;
  eclStage3: number;
  ratingDistribution: { rating: string; count: number; amount: number }[];
  provinceRisk: { province: string; npl: number; outstanding: number; lat: number; lng: number }[];
}

export interface EWSAlert {
  id: string;
  customerId: string;
  customerName: string;
  loanId: string;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  signals: string[];
  ewsScore: number;
  detectedAt: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface WorkflowTask {
  id: string;
  loanId: string;
  customerName: string;
  taskType: 'PRE_SCREEN' | 'AI_SCORING' | 'APPRAISAL' | 'APPROVAL' | 'DISBURSEMENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  assignee: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  slaDeadline: string;
  createdAt: string;
  amount: number;
}

export interface ComplianceReport {
  id: string;
  name: string;
  type: 'BC001' | 'BC002' | 'BC003' | 'BC004' | 'BC005';
  period: string;
  format: 'PDF' | 'Excel' | 'Both';
  status: 'Ready' | 'Draft' | 'Generating';
  generatedAt: string;
  size: string;
}

export interface AdversarialAttack {
  id: string;
  timestamp: string;
  attackType: 'FGSM' | 'PGD' | 'C&W' | 'DeepFool' | 'BIM';
  targetModel: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  epsilon: number;
  blocked: boolean;
  sourceIP: string;
}

export interface DriftFeature {
  name: string;
  psi: number;
  klDivergence: number;
  jsDistance: number;
  status: 'STABLE' | 'WATCH' | 'DRIFT';
}

export interface StressScenario {
  name: string;
  gdpGrowth: string;
  interestRate: string;
  unemployment: string;
  nplRate: number;
  expectedLoss: string;
  car: number;
  status: 'PASS' | 'FAIL';
}

export interface ModelLineageStep {
  step: string;
  timestamp: string;
  actor: string;
  details: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  department: string;
  email: string;
  isActive: boolean;
  lastLogin: string;
}

export interface SLAMetric {
  stage: string;
  targetHours: number;
  actualHours: number;
  onTimeRate: number;
  totalProcessed: number;
}
