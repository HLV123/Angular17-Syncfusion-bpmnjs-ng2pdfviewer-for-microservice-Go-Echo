import { Component, OnInit, signal, ViewChild, ElementRef } from '@angular/core'; import { CommonModule } from '@angular/common'; import { RouterModule } from '@angular/router'; import { FormsModule } from '@angular/forms'; import { MockDataService } from '../../core/services/mock-data.service';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
@Component({
  selector: 'app-workflow-dashboard', standalone: true, imports: [CommonModule, RouterModule, FormsModule],
  template: `<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">Workflow & Approval Engine</h1><p class="page-subtitle">Module WF001-WF005 · BPMN Viewer/Editor · Approval Forms · E-Signature · Task Management</p></div><button class="btn btn-primary btn-sm" (click)="view='designer'"><i class="fas fa-plus"></i> Design Workflow</button></div>
    <div class="kpi-grid">
      <div class="kpi-card kpi-blue" style="padding:16px"><div class="kpi-label">Active Processes</div><div class="kpi-value" style="font-size:1.6rem">{{activeProcesses}}</div></div>
      <div class="kpi-card kpi-green" style="padding:16px"><div class="kpi-label">Completed Today</div><div class="kpi-value" style="font-size:1.6rem">12</div></div>
      <div class="kpi-card kpi-orange" style="padding:16px"><div class="kpi-label">Overdue Tasks</div><div class="kpi-value" style="font-size:1.6rem">3</div></div>
      <div class="kpi-card kpi-red" style="padding:16px"><div class="kpi-label">Avg Cycle Time</div><div class="kpi-value" style="font-size:1.3rem">2.4 days</div></div>
    </div>
    <div class="tab-group" style="margin-bottom:20px">
      <div class="tab-item" [class.active]="view==='kanban'" (click)="view='kanban'">Kanban Board</div>
      <div class="tab-item" [class.active]="view==='list'" (click)="view='list'">Task List</div>
      <div class="tab-item" [class.active]="view==='processes'" (click)="view='processes'">Process Definitions</div>
      <div class="tab-item" [class.active]="view==='designer'" (click)="view='designer'"><i class="fas fa-drafting-compass" style="margin-right:4px"></i>Workflow Designer</div>
    </div>
    @if(view==='kanban'){
    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;overflow-x:auto">
      @for(col of kanbanCols;track col.status){<div style="background:var(--bg-tertiary);border-radius:12px;padding:12px;min-width:220px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><strong style="font-size:.85rem">{{col.label}}</strong><span class="badge" [class]="col.badge">{{col.items.length}}</span></div>
        @for(item of col.items;track item.id){<div style="background:var(--bg-primary);border-radius:10px;padding:12px;margin-bottom:8px;border-left:3px solid;cursor:pointer" [style.border-color]="col.color" (click)="openApproval(item)">
          <div style="font-weight:600;font-size:.85rem;margin-bottom:4px">{{item.id}}</div>
          <div style="font-size:.8rem;color:var(--text-secondary);margin-bottom:6px">{{item.customer}}</div>
          <div style="display:flex;justify-content:space-between;align-items:center"><span style="font-size:.7rem;color:var(--text-tertiary)">{{item.assignee}}</span><span class="badge" [class]="item.priority==='HIGH'?'badge-danger':item.priority==='MEDIUM'?'badge-warning':'badge-info'" style="font-size:.65rem">{{item.priority}}</span></div>
        </div>}
      </div>}
    </div>}
    @if(view==='list'){
    <div class="card"><table class="data-table"><thead><tr><th>Task</th><th>Hồ sơ</th><th>Process</th><th>Assignee</th><th>Priority</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
      @for(t of allTasks;track t.id){<tr><td><strong>{{t.task}}</strong></td><td>{{t.loanId}}</td><td><small>{{t.process}}</small></td><td>{{t.assignee}}</td><td><span class="badge" [class]="t.priority==='HIGH'?'badge-danger':t.priority==='MEDIUM'?'badge-warning':'badge-info'">{{t.priority}}</span></td><td style="font-size:.82rem" [style.color]="t.overdue?'var(--brand-danger)':'var(--text-primary)'">{{t.due}}</td><td><span class="badge" [class]="t.status==='TODO'?'badge-info':t.status==='IN_PROGRESS'?'badge-warning':'badge-success'">{{t.status}}</span></td><td><button class="btn btn-sm btn-primary" (click)="openApproval(t)"><i class="fas fa-play"></i></button></td></tr>}
    </tbody></table></div>}
    @if(view==='processes'){
    <div class="row-flex">@for(p of processes;track p.name){<div class="card col-6">
      <div class="card-header"><h3><i class="fas fa-project-diagram"></i> {{p.name}}</h3><span class="badge" [class]="p.active?'badge-success':'badge-info'">{{p.active?'Active':'Draft'}}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;font-size:.85rem"><div><small style="color:var(--text-tertiary)">Version</small><br><strong>{{p.version}}</strong></div><div><small style="color:var(--text-tertiary)">Instances</small><br><strong>{{p.instances}}</strong></div><div><small style="color:var(--text-tertiary)">Avg Duration</small><br><strong>{{p.avgDuration}}</strong></div><div><small style="color:var(--text-tertiary)">SLA Compliance</small><br><strong [style.color]="p.sla>=90?'var(--brand-success)':'var(--brand-warning)'">{{p.sla}}%</strong></div></div>
      <div style="display:flex;gap:6px"><button class="btn btn-sm btn-secondary" (click)="openBpmn(p)"><i class="fas fa-sitemap"></i> BPMN</button><button class="btn btn-sm btn-secondary"><i class="fas fa-chart-bar"></i> Analytics</button><button class="btn btn-sm btn-secondary" (click)="view='designer'"><i class="fas fa-edit"></i> Edit</button></div>
    </div>}</div>}
    @if(view==='designer'){
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-drafting-compass"></i> Workflow Designer (WF005)</h3><span class="badge badge-tech">bpmn-js Editor</span></div>
      <div style="margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap">
        <div class="form-group" style="flex:1;min-width:200px"><label>Tên Workflow</label><input type="text" [(ngModel)]="designerName" placeholder="Loan Approval v3" style="width:100%;padding:8px 12px;border:1px solid var(--border-light);border-radius:8px"></div>
        <div class="form-group" style="width:150px"><label>Sản phẩm</label><select [(ngModel)]="designerProduct" style="width:100%;padding:8px 12px;border:1px solid var(--border-light);border-radius:8px"><option>Tiêu dùng</option><option>Mua nhà</option><option>SXKD</option><option>Tất cả</option></select></div>
        <div class="form-group" style="width:150px"><label>Hạn mức tối đa</label><input type="text" value="5,000M" style="width:100%;padding:8px 12px;border:1px solid var(--border-light);border-radius:8px"></div>
      </div>
      <div style="padding:12px;background:var(--bg-tertiary);border-radius:10px;margin-bottom:16px">
        <strong style="margin-bottom:8px;display:block">Workflow Steps (drag to reorder):</strong>
        @for(s of designerSteps;track s.name){<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-primary);border-radius:8px;margin-bottom:6px;border-left:3px solid" [style.border-color]="s.color">
          <i class="fas fa-grip-vertical" style="color:var(--text-tertiary);cursor:grab"></i>
          <i [class]="s.icon" [style.color]="s.color"></i>
          <div style="flex:1"><strong>{{s.name}}</strong><br><small style="color:var(--text-tertiary)">{{s.role}} · SLA: {{s.sla}}</small></div>
          <select style="padding:4px 8px;border:1px solid var(--border-light);border-radius:6px;font-size:.75rem"><option>Required</option><option>Optional</option><option>Auto-skip</option></select>
          <button class="btn btn-sm btn-secondary" style="padding:4px 6px"><i class="fas fa-cog"></i></button>
        </div>}
        <button class="btn btn-sm btn-secondary" style="margin-top:8px"><i class="fas fa-plus"></i> Thêm bước</button>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-secondary"><i class="fas fa-eye"></i> Preview BPMN</button><button class="btn btn-primary"><i class="fas fa-save"></i> Lưu Workflow</button></div>
    </div>}

    @if(showBpmnModal()){<div class="modal-overlay" (click)="closeBpmn()"><div class="modal-content" style="width:90%;max-width:1000px;height:80vh;display:flex;flex-direction:column" (click)="$event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;margin-bottom:16px"><h2 style="margin:0"><i class="fas fa-project-diagram" style="margin-right:8px"></i>BPMN Diagram: {{selectedProcess?.name}}</h2><button class="btn btn-sm btn-secondary" (click)="closeBpmn()"><i class="fas fa-times"></i></button></div>
      <div style="flex:1;border:1px solid var(--border-light);background:#f8fafc;border-radius:8px;overflow:hidden;position:relative">
        <div #bpmnContainer style="width:100%;height:100%"></div>
      </div>
    </div></div>}

    @if(showApprovalModal()){<div class="modal-overlay" (click)="showApprovalModal.set(false)"><div class="modal-content" style="max-width:800px;max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;margin-bottom:20px"><h2><i class="fas fa-clipboard-check" style="margin-right:8px;color:var(--brand-accent)"></i>Thẩm định & Phê duyệt (WF002-WF003)</h2><button class="btn btn-sm btn-secondary" (click)="showApprovalModal.set(false)"><i class="fas fa-times"></i></button></div>
      <div style="display:flex;gap:16px;margin-bottom:20px">
        <div style="flex:1;padding:16px;background:var(--bg-tertiary);border-radius:12px"><strong>Hồ sơ:</strong> {{approvalTask?.loanId}}<br><strong>Khách hàng:</strong> {{approvalTask?.customer}}<br><strong>Task:</strong> {{approvalTask?.task}}</div>
        <div style="padding:16px;background:#EFF6FF;border-radius:12px;text-align:center;min-width:140px"><small style="color:var(--text-tertiary)">AI Recommend</small><br><span class="badge badge-success" style="font-size:1rem;padding:6px 16px;margin-top:6px">APPROVE</span><br><strong style="font-size:1.5rem;color:var(--brand-success);margin-top:4px;display:block">731</strong></div>
      </div>
      <h4 style="margin-bottom:12px"><i class="fas fa-tasks" style="margin-right:6px"></i>Checklist thẩm định</h4>
      <div style="margin-bottom:20px">@for(c of approvalChecklist;track c.label){<div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid var(--border-light)"><input type="checkbox" [(ngModel)]="c.checked" style="width:18px;height:18px;cursor:pointer"><span [style.text-decoration]="c.checked?'line-through':'none'" [style.color]="c.checked?'var(--text-tertiary)':'var(--text-primary)'">{{c.label}}</span></div>}</div>
      <div class="form-group"><label>Ghi chú thẩm định</label><textarea rows="3" placeholder="Nhận xét về hồ sơ khách hàng..." style="width:100%;padding:10px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main)"></textarea></div>
      <div class="form-group"><label>Điều kiện vay (nếu duyệt có điều kiện)</label><input type="text" placeholder="VD: Bổ sung sao kê lương 6 tháng gần nhất" style="width:100%;padding:8px 12px;border:1px solid var(--border-light);border-radius:8px"></div>
      <div style="padding:16px;background:var(--bg-tertiary);border-radius:12px;margin:16px 0">
        <h4 style="margin-bottom:10px"><i class="fas fa-signature" style="margin-right:6px;color:var(--brand-accent)"></i>Ký số phê duyệt (WF003)</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.85rem">
          <div><small style="color:var(--text-tertiary)">Người ký</small><br><strong>Lê Văn Officer</strong></div>
          <div><small style="color:var(--text-tertiary)">Vai trò</small><br><strong>Credit Officer</strong></div>
          <div><small style="color:var(--text-tertiary)">Timestamp</small><br><strong>{{currentTime}}</strong></div>
          <div><small style="color:var(--text-tertiary)">IP Address</small><br><strong style="font-family:var(--font-mono)">10.0.1.45</strong></div>
        </div>
        <div style="margin-top:12px;padding:12px;background:#FEF3C7;border-radius:8px;font-size:.82rem"><i class="fas fa-info-circle" style="color:var(--brand-warning);margin-right:6px"></i>Ký số sẽ được ghi nhận vào Audit Trail và không thể sửa đổi.</div>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end"><button class="btn btn-secondary" (click)="showApprovalModal.set(false)">Yêu cầu bổ sung</button><button class="btn btn-danger" (click)="showApprovalModal.set(false)"><i class="fas fa-times"></i> Từ chối</button><button class="btn btn-primary" (click)="showApprovalModal.set(false)"><i class="fas fa-check"></i> Phê duyệt & Ký số</button></div>
    </div></div>}
  </div>`, styles: ['']
})
export class WorkflowDashboardComponent implements OnInit {
  @ViewChild('bpmnContainer') bpmnContainer!: ElementRef;
  viewer: any; showBpmnModal = signal(false); selectedProcess: any;
  showApprovalModal = signal(false); approvalTask: any = null;
  currentTime = new Date().toLocaleString('vi-VN');
  view = 'kanban'; activeProcesses = 0; kanbanCols: any[] = []; allTasks: any[] = [];
  designerName = ''; designerProduct = 'Tất cả';
  designerSteps = [
    { name: 'Tiếp nhận hồ sơ', role: 'Customer Service', sla: '30 phút', icon: 'fas fa-inbox', color: '#6366F1' },
    { name: 'Pre-screening tự động', role: 'System (AI)', sla: '30 giây', icon: 'fas fa-robot', color: '#2563EB' },
    { name: 'AI Scoring Pipeline', role: 'System (AI)', sla: '3 phút', icon: 'fas fa-brain', color: '#7C3AED' },
    { name: 'Thẩm định chuyên viên', role: 'Credit Analyst', sla: '4 giờ', icon: 'fas fa-search', color: '#F59E0B' },
    { name: 'Phê duyệt cán bộ (≤500M)', role: 'Credit Officer', sla: '2 giờ', icon: 'fas fa-user-check', color: '#059669' },
    { name: 'Phê duyệt trưởng phòng (≤5B)', role: 'Credit Manager', sla: '1 ngày', icon: 'fas fa-user-tie', color: '#DC2626' },
    { name: 'Giải ngân', role: 'Treasury', sla: '1 ngày', icon: 'fas fa-money-bill-wave', color: '#10B981' }
  ];
  approvalChecklist = [
    { label: 'Xác minh thông tin CCCD/CMND qua eKYC', checked: true },
    { label: 'Kiểm tra lịch sử tín dụng CIC', checked: true },
    { label: 'Xác minh nguồn thu nhập (sao kê lương/BCTC)', checked: false },
    { label: 'Thẩm định tài sản đảm bảo (nếu có)', checked: false },
    { label: 'Đối chiếu AI Score vs nhận xét thực tế', checked: false },
    { label: 'Kiểm tra mục đích vay hợp pháp', checked: false },
    { label: 'Xác nhận DTI/LTV trong ngưỡng cho phép', checked: false },
    { label: 'Review XAI explanation & fairness check', checked: false }
  ];
  processes = [
    { name: 'Loan Approval Process', version: 'v2.3', instances: 156, avgDuration: '2.4 days', sla: 92, active: true },
    { name: 'Document Verification', version: 'v1.8', instances: 89, avgDuration: '4 hours', sla: 96, active: true },
    { name: 'Disbursement Process', version: 'v1.2', instances: 45, avgDuration: '1 day', sla: 88, active: true },
    { name: 'Collection Workflow', version: 'v1.0', instances: 12, avgDuration: '5 days', sla: 75, active: false }
  ];
  constructor(private m: MockDataService) { }
  ngOnInit() {
    const loans = this.m.getLoans(); this.activeProcesses = loans.filter(l => !['DRAFT', 'DISBURSED', 'REJECTED'].includes(l.status)).length;
    const tasks = [
      { id: 'T001', task: 'Pre-screening Review', loanId: 'LV-2435', customer: 'Nguyễn Thị Hồng', process: 'Loan Approval', assignee: 'Trần Analyst', priority: 'HIGH', due: '25/02', overdue: false, status: 'TODO' },
      { id: 'T002', task: 'AI Score Review', loanId: 'LV-2436', customer: 'Phạm Minh Châu', process: 'Loan Approval', assignee: 'Lê Officer', priority: 'MEDIUM', due: '25/02', overdue: false, status: 'IN_PROGRESS' },
      { id: 'T003', task: 'Document Verification', loanId: 'LV-2437', customer: 'Lê Đức Dũng', process: 'Doc Verify', assignee: 'Nguyễn CS', priority: 'HIGH', due: '24/02', overdue: true, status: 'TODO' },
      { id: 'T004', task: 'Collateral Appraisal', loanId: 'LV-2439', customer: 'Bùi Thanh Hải', process: 'Loan Approval', assignee: 'Hoàng Appraiser', priority: 'MEDIUM', due: '26/02', overdue: false, status: 'IN_PROGRESS' },
      { id: 'T005', task: 'Final Approval', loanId: 'LV-2442', customer: 'Hoàng Văn Phú', process: 'Loan Approval', assignee: 'Manager Phạm', priority: 'LOW', due: '27/02', overdue: false, status: 'TODO' },
      { id: 'T006', task: 'Disbursement Check', loanId: 'LV-2438', customer: 'Đỗ Thị Mai', process: 'Disbursement', assignee: 'Treasury', priority: 'MEDIUM', due: '25/02', overdue: false, status: 'DONE' }
    ];
    this.allTasks = tasks;
    this.kanbanCols = [
      { status: 'TODO', label: 'To Do', badge: 'badge-info', color: '#2563EB', items: tasks.filter(t => t.status === 'TODO') },
      { status: 'IN_PROGRESS', label: 'In Progress', badge: 'badge-warning', color: '#F59E0B', items: tasks.filter(t => t.status === 'IN_PROGRESS') },
      { status: 'REVIEW', label: 'Review', badge: 'badge-info', color: '#6366F1', items: [] },
      { status: 'DONE', label: 'Done', badge: 'badge-success', color: '#059669', items: tasks.filter(t => t.status === 'DONE') },
      { status: 'BLOCKED', label: 'Blocked', badge: 'badge-danger', color: '#DC2626', items: [] }
    ];
  }
  openApproval(t: any) { this.approvalTask = t; this.approvalChecklist.forEach(c => c.checked = false); this.showApprovalModal.set(true); }
  openBpmn(p: any) { this.selectedProcess = p; this.showBpmnModal.set(true); setTimeout(() => { this.viewer = new BpmnViewer({ container: this.bpmnContainer.nativeElement }); this.viewer.importXML(this.getDummyBPMN()).catch((err: any) => console.error('BPMN Error', err)); }, 100); }
  closeBpmn() { this.showBpmnModal.set(false); if (this.viewer) { this.viewer.destroy(); this.viewer = null; } }
  getDummyBPMN() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1xx0xz4" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="4.6.0">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Recive App"><bpmn:outgoing>Flow_1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:task id="Task_1" name="AI Scoring"><bpmn:incoming>Flow_1</bpmn:incoming><bpmn:outgoing>Flow_2</bpmn:outgoing></bpmn:task>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:exclusiveGateway id="Gateway_1" name="Score &#62; 600?"><bpmn:incoming>Flow_2</bpmn:incoming><bpmn:outgoing>Flow_3</bpmn:outgoing><bpmn:outgoing>Flow_4</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1" />
    <bpmn:task id="Task_2" name="Auto Approve"><bpmn:incoming>Flow_3</bpmn:incoming><bpmn:outgoing>Flow_5</bpmn:outgoing></bpmn:task>
    <bpmn:sequenceFlow id="Flow_3" name="Yes" sourceRef="Gateway_1" targetRef="Task_2" />
    <bpmn:task id="Task_3" name="Manual Review"><bpmn:incoming>Flow_4</bpmn:incoming><bpmn:outgoing>Flow_6</bpmn:outgoing></bpmn:task>
    <bpmn:sequenceFlow id="Flow_4" name="No" sourceRef="Gateway_1" targetRef="Task_3" />
    <bpmn:endEvent id="EndEvent_1" name="Disburse"><bpmn:incoming>Flow_5</bpmn:incoming><bpmn:incoming>Flow_6</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="EndEvent_1" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1"><bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1"><dc:Bounds x="170" y="100" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1"><dc:Bounds x="260" y="78" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_1_di" bpmnElement="Gateway_1" isMarkerVisible="true"><dc:Bounds x="425" y="93" width="50" height="50" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_2_di" bpmnElement="Task_2"><dc:Bounds x="530" y="78" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_3_di" bpmnElement="Task_3"><dc:Bounds x="530" y="190" width="100" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1"><dc:Bounds x="692" y="100" width="36" height="36" /></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1"><di:waypoint x="206" y="118" /><di:waypoint x="260" y="118" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2"><di:waypoint x="360" y="118" /><di:waypoint x="425" y="118" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3"><di:waypoint x="475" y="118" /><di:waypoint x="530" y="118" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4"><di:waypoint x="450" y="143" /><di:waypoint x="450" y="230" /><di:waypoint x="530" y="230" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5"><di:waypoint x="630" y="118" /><di:waypoint x="692" y="118" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6"><di:waypoint x="630" y="230" /><di:waypoint x="661" y="230" /><di:waypoint x="661" y="118" /><di:waypoint x="692" y="118" /></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`;
  }
}
