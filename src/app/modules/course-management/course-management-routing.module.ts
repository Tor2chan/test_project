import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseManagementMainComponent } from './course-management-main/course-management-main.component';
import { CourseManagementListComponent } from './course-management-list/course-management-list.component';
import { CourseRoundListComponent } from './course-round-list/course-round-list.component';
import { CourseRoundMainComponent } from './course-round-main/course-round-main.component';
import { CourseRoundCreateComponent } from './course-round-create/course-round-create.component';
import { RoundCancellationComponent} from './round-cancellation/round-cancellation.component';
import { RoundCancellationConfirmationComponent } from './round-cancellation-confirmation/round-cancellation-confirmation.component';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { CoursePreviewComponent } from '../component/course-preview/course-preview.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'course-management-list',
        pathMatch: 'full'

    },
    {
        path: 'course-management-list',
        component: CourseManagementListComponent,
        canActivate: [AuthGuard]

    },
    {
        path: 'course-management-manage',
        component: CourseManagementMainComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'course-round-list',
        component: CourseRoundListComponent,
        canActivate: [AuthGuard]

    },
    {
        path: 'course-round-manage',
        component: CourseRoundMainComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'course-preview',
        component: CoursePreviewComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'round-cancellation',
        component: RoundCancellationComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'round-cancellation-confirmation',
        component: RoundCancellationConfirmationComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CourseManagementRoutingModule {}
