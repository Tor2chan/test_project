import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferedCourseReportComponent } from './offered-course-report/offered-course-report.component';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { CanceledCourseReportComponent } from './canceled-course-report/canceled-course-report.component';
import { EnrollmentListReportComponent } from './enrollment-list-report/enrollment-list-report.component';
import { CourseEnrollmentReportComponent } from './course-enrollment-report/course-enrollment-report.component';
import { CoursePaymentReportComponent } from './course-payment-report/course-payment-report.component';
import { EnrollmentAndPaymentReportComponent } from './enrollment-and-payment-report/enrollment-and-payment-report.component';
import { DepartmentIncomeReportComponent } from './department-income-report/department-income-report.component';
import { TransferCourseReportComponent } from './transfer-course-report/transfer-course-report.component';
import { SkillMappingReportComponent } from './skill-mapping-report/skill-mapping-report.component';

const routes: Routes = [
    { path: '', redirectTo: 'offered-course-report', pathMatch: 'full' },
    {
        path: 'offered-course-report',
        component: OfferedCourseReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'canceled-course-report',
        component: CanceledCourseReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'enrollment-list-report',
        component: EnrollmentListReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'course-enrollment-report',
        component: CourseEnrollmentReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'course-payment-report',
        component: CoursePaymentReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'enrollment-and-payment-report',
        component: EnrollmentAndPaymentReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'department-income-report',
        component: DepartmentIncomeReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'transferable-course-report',
        component: TransferCourseReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path:'skill-mapping-report',
        component: SkillMappingReportComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportRoutingModule {}
