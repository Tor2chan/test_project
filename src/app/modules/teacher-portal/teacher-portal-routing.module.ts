import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherPortalListComponent } from './teacher-portal-list/teacher-portal-list.component';
import { AuthGuard } from 'src/app/guard/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'teacher-course',
        pathMatch: 'full'
    },
    {
        path: 'teacher-course',
        component: TeacherPortalListComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TeacherPortalRoutingModule {}
