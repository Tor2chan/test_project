import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { AuthGuard } from 'src/app/guard/auth.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
    },
    {
        path: '',
        component: WelcomePageComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class WelcomeRoutingModule {}
