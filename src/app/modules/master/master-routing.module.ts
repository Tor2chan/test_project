import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GeneralSkillListComponent } from './general-skill/general-skill-list/general-skill-list.component';
import { OccupationListComponent } from './occupation/occupation-list/occupation-list.component';
import { BankListComponent } from './bank/bank-list/bank-list.component';
import { BankBranchListComponent } from './bank-branch/bank-branch-list/bank-branch-list.component';
import { SharePercentListComponent } from './share-percent/share-percent-list/share-percent-list.component';
import { OccupationGroupListComponent } from './occupation-group/occupation-group-list/occupation-group-list.component';
import { FacultyListComponent } from './faculty/faculty-list/faculty-list.component';
import { CourseTypeListComponent } from './course-type/course-type-list/course-type-list.component';
import { CurriculumTypeListComponent } from './curriculum/curriculum-type-list/curriculum-type-list.component';
import { SubjectTypeListComponent } from './subject/subject-type-list/subject-type-list.component';
import { FeeListComponent } from './fee/fee-list/fee-list.component';
import { NotificationListComponent } from './notification/notification-list/notification-list.component';
import { ConsentManagementListComponent } from './consent-management/consent-management-list/consent-management-list.component';
import { WebsiteBannerListComponent } from './website-banner/website-banner-list/website-banner-list.component';
import { CampaignListComponent } from './campaign/campaign-list/campaign-list.component';
import { PersonalListComponent } from './personal/personal-list/personal-list.component';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { SettingReceiptComponent } from './setting-receipt/setting-receipt.component';
import { BankAccountManageComponent } from './bank-account/bank-account-manage/bank-account-manage.component';

const routes: Routes = [
    { path: '', redirectTo: 'general-skill', pathMatch: 'full' },
    {
        path: 'general-skill',
        component: GeneralSkillListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'occupation',
        component: OccupationListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'occupation-group',
        component: OccupationGroupListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'bank',
        component: BankListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'bank-branch',
        component: BankBranchListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'bank-account',
        component: BankAccountManageComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'share-percent',
        component: SharePercentListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'faculty',
        component: FacultyListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'course-type',
        component: CourseTypeListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'curriculum',
        component: CurriculumTypeListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'subject',
        component: SubjectTypeListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'fee',
        component: FeeListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'notification',
        component: NotificationListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'consent-management',
        component: ConsentManagementListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'website-banner',
        component: WebsiteBannerListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'campaign',
        component: CampaignListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'personal',
        component: PersonalListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'setting-receipt',
        component: SettingReceiptComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class MasterRoutingModule {}
