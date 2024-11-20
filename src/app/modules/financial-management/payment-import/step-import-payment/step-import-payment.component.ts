import { Component, DoCheck, Input, OnInit,SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { IMPORT_PAYMENT_PAGE, UploadFileData } from 'src/app/models/common';
import { TmpFinanceImportLogData } from 'src/app/models/financial-management';

export interface FinanceLog extends Partial<TmpFinanceImportLogData> {
    page: IMPORT_PAYMENT_PAGE;
    uploadFileData?: UploadFileData;
}

@Component({
    selector: 'app-step-import-payment',
    templateUrl: './step-import-payment.component.html',
    styleUrls: ['./step-import-payment.component.scss']
})
export class StepImportPaymentComponent implements OnInit, DoCheck {
    @Input() lang: string = 'th';

    items: MenuItem[] = [];

    activeIndex: number = 0;

    page: IMPORT_PAYMENT_PAGE = IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_FIRST;
    pageType = IMPORT_PAYMENT_PAGE;

    item: FinanceLog;

    constructor(public translate: TranslateService, private router: Router) {
        const payment = localStorage.getItem('payment');
        if (payment && Object.keys(payment).length > 0) {
            this.item = JSON.parse(payment);
            this.page = this.item.page;
            this.activeIndex = this.item.page;
        } else {
            this.item = { page: IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_FIRST };
            localStorage.setItem('payment', JSON.stringify(this.item));
        }
    }

    ngDoCheck(): void {
        const newLang = localStorage.getItem('lang');
        if (this.lang !== newLang) {
            this.lang = newLang;
            this.translateItems();
        }
    }

    ngOnInit() {
        this.items = [
            {
                label: this.translate.instant('financeManagement.financeImport.step.selectCourse')
            },
            {
                label: this.translate.instant('financeManagement.financeImport.step.selectFile')
            },
            {
                label: this.translate.instant('financeManagement.financeImport.step.check')
            },
            {
                label: this.translate.instant('financeManagement.financeImport.step.save')
            }
        ];
        this.page = this.activeIndex;
    }

    translateItems() {
        this.items = [
            {
                label: this.translate.instant('financeManagement.financeImport.step.selectCourse')
            },
            {
                label: this.translate.instant('financeManagement.financeImport.step.selectFile')
            },
            {
                label: this.translate.instant('financeManagement.financeImport.step.check')
            },
            {
                label: this.translate.instant('financeManagement.financeImport.step.save')
            }
        ];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.translateItems();
        }
    }

    openPage(event: IMPORT_PAYMENT_PAGE) {
        this.activeIndex = event;
        this.page = event;
        this.item.page = event;
    }

    redirectToListPage(event: boolean) {
        localStorage.removeItem('payment');
        if (event) {
            this.router.navigate(['/financial-management/payment-list']);
        } else {
            this.router.navigate(['/financial-management/payment-import']);
        }
    }
}
