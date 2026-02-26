import { Component } from '@angular/core';import { CommonModule } from '@angular/common';import { FormsModule } from '@angular/forms';import { RouterModule } from '@angular/router';
@Component({selector:'app-user-management',standalone:true,imports:[CommonModule,FormsModule,RouterModule],
  template:`<div class="page-container"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px"><div><h1 class="page-title">User Management</h1><p class="page-subtitle">Keycloak SSO · RBAC · 8 Roles · LDAP Sync</p></div><div style="display:flex;gap:8px"><a routerLink="/admin" class="btn btn-secondary btn-sm"><i class="fas fa-arrow-left"></i></a><button class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Add User</button></div></div>
    <div class="card" style="margin-bottom:16px"><div style="display:flex;gap:12px;align-items:center"><input type="text" [(ngModel)]="search" placeholder="Tìm user..." style="flex:1;padding:10px 14px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main)"><select [(ngModel)]="roleFilter" style="padding:10px;border:1px solid var(--border-light);border-radius:8px;font-family:var(--font-main)"><option value="">All Roles</option>@for(r of roles;track r){<option [value]="r">{{r}}</option>}</select><span class="badge badge-info">{{getFiltered().length}} users</span></div></div>
    <div class="card"><table class="data-table"><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Last Login</th><th></th></tr></thead><tbody>
      @for(u of getFiltered();track u.username){<tr><td><div style="display:flex;align-items:center;gap:10px"><div style="width:36px;height:36px;border-radius:50%;background:var(--brand-accent);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem">{{u.name.charAt(0)}}</div><div><strong>{{u.name}}</strong><br><small style="color:var(--text-tertiary)">{{u.username}}</small></div></div></td><td style="font-size:.85rem">{{u.email}}</td><td><span class="badge badge-tech">{{u.role}}</span></td><td>{{u.dept}}</td><td><span class="badge" [class]="u.active?'badge-success':'badge-danger'">{{u.active?'Active':'Disabled'}}</span></td><td style="font-size:.82rem">{{u.lastLogin}}</td><td><button class="btn btn-sm btn-secondary"><i class="fas fa-edit"></i></button></td></tr>}
    </tbody></table></div>
  </div>`,styles:['']
})
export class UserManagementComponent{
  search='';roleFilter='';
  roles=['ANALYST','OFFICER','MANAGER','RISK_MANAGER','DATA_SCIENTIST','COMPLIANCE','ADMIN','CS_SUPPORT'];
  users=[
    {username:'analyst_tran',name:'Trần Minh Đức',email:'tran.duc@bank.vn',role:'ANALYST',dept:'Credit Dept',active:true,lastLogin:'25/02 08:30'},
    {username:'officer_le',name:'Lê Thị Hương',email:'le.huong@bank.vn',role:'OFFICER',dept:'Credit Dept',active:true,lastLogin:'25/02 09:00'},
    {username:'manager_pham',name:'Phạm Quốc Bảo',email:'pham.bao@bank.vn',role:'MANAGER',dept:'Credit Dept',active:true,lastLogin:'25/02 07:45'},
    {username:'risk_vo',name:'Võ Thanh Sơn',email:'vo.son@bank.vn',role:'RISK_MANAGER',dept:'Risk Mgmt',active:true,lastLogin:'24/02 16:30'},
    {username:'ds_nguyen',name:'Nguyễn Hoàng Nam',email:'nguyen.nam@bank.vn',role:'DATA_SCIENTIST',dept:'AI Lab',active:true,lastLogin:'25/02 08:00'},
    {username:'compliance_dao',name:'Đào Minh Tâm',email:'dao.tam@bank.vn',role:'COMPLIANCE',dept:'Compliance',active:true,lastLogin:'24/02 14:00'},
    {username:'admin_sys',name:'System Admin',email:'admin@bank.vn',role:'ADMIN',dept:'IT',active:true,lastLogin:'25/02 06:00'},
    {username:'cs_hoang',name:'Hoàng Thị Linh',email:'hoang.linh@bank.vn',role:'CS_SUPPORT',dept:'Customer Service',active:true,lastLogin:'25/02 09:15'}
  ];
  getFiltered(){return this.users.filter(u=>(!this.search||u.name.toLowerCase().includes(this.search.toLowerCase())||u.username.includes(this.search))&&(!this.roleFilter||u.role===this.roleFilter));}
}
