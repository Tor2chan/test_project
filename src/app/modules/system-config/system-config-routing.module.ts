import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { SetFrontendComponent } from './set-frontend/set-frontend.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'set-frontend',
        pathMatch: 'full'
    },
    {
        path: 'set-frontend',
        component: SetFrontendComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SystemConfigRoutingModule {}
