import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { IMPORT_PAYMENT_PAGE } from 'src/app/models/common';
import { FinanceLog } from '../step-import-payment.component';
import { TablePageEvent } from 'primeng/table';
import { FinancialManagementService } from 'src/app/services/financial-management.service';
import { TmpFinanceImportDetailData, TmpFinanceImportLogData } from 'src/app/models/financial-management';

@Component({
    selector: 'app-import-payment-third',
    templateUrl: './import-payment-third.component.html',
    styleUrls: ['./import-payment-third.component.scss']
})
export class ImportPaymentThirdComponent implements OnInit, AfterViewInit {

    @Input() lang: string = 'th';

    @Output() openPage = new EventEmitter();

    item: FinanceLog;

    model: TmpFinanceImportLogData;

    criteria: TmpFinanceImportDetailData = {
        tmpImpId: null,
        activeFlag: null,
        first: 0,
        size: 5
    };

    items: TmpFinanceImportDetailData[] = [];
    totalRecords: number = 0;

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
            this.setStorage();
        }
    }

    ngOnInit(): void {
        this.loadModel();
    }

    loadModel() {
        this.financialManagementService.getTmpFinanceImportLog(this.item.tmpImpId).subscribe((result) => {
            this.loaderService.stop();
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

    ngAfterViewInit(): void {
        this.fetchData();
    }

    showByFlag(event: boolean | null) {
        this.criteria.activeFlag = event;
        this.fetchData();
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        this.criteria.tmpImpId = this.item.tmpImpId;

        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
        }

        this.financialManagementService.findTmpFinanceImportDetail(this.criteria).subscribe((result) => {
            this.initForm = true;
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
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
        this.item.page = IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_FOURTH;
        this.setStorage();
        this.openPage.emit(IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_FOURTH);
    }

    onBack() {
        this.item.page = IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_SECOND;
        this.setStorage();
        this.openPage.emit(IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_SECOND);
    }

    setStorage() {
        localStorage.setItem('payment', JSON.stringify(this.item));
    }
}
