import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentListComponent } from './payment-list/payment-list.component';
import { AuthGuard } from 'src/app/guard/auth.guard';
import { PaymentImportComponent } from './payment-import/payment-import.component';
import { StepImportPaymentComponent } from './payment-import/step-import-payment/step-import-payment.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'payment-list',
        pathMatch: 'full'
    },
    {
        path: 'payment-list',
        component: PaymentListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'payment-import',
        component: PaymentImportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'payment-import/import',
        component: StepImportPaymentComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class FinancialManagementRoutingModule {}
