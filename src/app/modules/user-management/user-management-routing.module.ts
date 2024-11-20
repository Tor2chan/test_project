import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListComponent } from './user-list/user-list.component';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { RoleListComponent } from './role-list/role-list.component';
import { MemberListComponent } from './member-list/member-list.component';
import { UserRoleListComponent } from './role-list/user-role-list/user-role-list.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'user-management-list',
        pathMatch: 'full'

    },
    {
        path: 'user-role',
        component: UserRoleListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'user',
        component: UserListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'role',
        component: RoleListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'member',
        component: MemberListComponent,
        canActivate: [AuthGuard]
    }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserManagementRoutingModule { }
