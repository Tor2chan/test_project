import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { IMPORT_PAYMENT_PAGE } from 'src/app/models/common';
import { FinanceLog } from '../step-import-payment.component';
import { TmpFinanceImportLogData } from 'src/app/models/financial-management';
import { FinancialManagementService } from 'src/app/services/financial-management.service';

@Component({
    selector: 'app-import-payment-fourth',
    templateUrl: './import-payment-fourth.component.html',
    styleUrls: ['./import-payment-fourth.component.scss']
})
export class ImportPaymentFourthComponent implements OnInit {
    @Input() lang: string = 'th';

    @Output() openPage = new EventEmitter();
    @Output() backToList = new EventEmitter();

    item: FinanceLog;

    model: TmpFinanceImportLogData;

    initForm: boolean = false;

    constructor(
        public translate: TranslateService,
        private financialManagementService: FinancialManagementService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService
    ) {
        const payment = localStorage.getItem('payment');
        if (payment && Object.keys(payment).length > 0) {
            this.item = JSON.parse(payment);
        } else {
            localStorage.setItem('payment', JSON.stringify(this.item));
            this.setStorage();
        }
    }

    ngOnInit(): void {
        this.loadModel();
    }

    loadModel() {
        this.loaderService.start();
        this.financialManagementService.getTmpFinanceImportLog(this.item.tmpImpId).subscribe((result) => {
            this.loaderService.stop();
            this.initForm = true;
            if (result.status === 200) {
                this.model = result.entries;
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: result.message,
                    life: 2000
                });
            }
        });
    }

    onNext() {
        this.loaderService.start();
        this.financialManagementService
            .putTmpFinanceImportLogCommit(this.model.tmpImpId, this.model)
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    // success
                    localStorage.removeItem('payment');
                    this.backToList.emit(true);
                } else if (status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });
    }

    onBack() {
        this.openPage.emit(IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_THIRD);
    }

    setStorage() {
        localStorage.setItem('payment', JSON.stringify(this.item));
    }
}
