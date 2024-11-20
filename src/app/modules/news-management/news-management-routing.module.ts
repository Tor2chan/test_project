import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsManagementListComponent } from './news-management-list/news-management-list.component';
import { AuthGuard } from 'src/app/guard/auth.guard';
const routes: Routes = [
    {
        path: '',
        redirectTo: 'news-management-list',
        pathMatch: 'full'
    },
    {
        path: 'news-management-list',
        component: NewsManagementListComponent,
        canActivate: [AuthGuard]
    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class NewsManagementRoutingModule {}
