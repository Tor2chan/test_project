import { Component, EventEmitter, Input, Output, OnInit, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { FinanceImportDetailData, FinanceImportLogData } from 'src/app/models/financial-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { FinancialManagementService } from 'src/app/services/financial-management.service';

@Component({
    selector: 'app-payment-import-manage',
    templateUrl: './payment-import-manage.component.html',
    styleUrls: ['./payment-import-manage.component.scss']
})
export class PaymentImportManageComponent implements OnInit, DoCheck {
    processing: boolean = false;
    initForm: boolean = false;

    @Output() backToListPage = new EventEmitter();

    @Input() item!: FinanceImportLogData;

    coursepublicMain: CoursepublicMainData;

    items: FinanceImportDetailData[] = [];
    financeImportLog: FinanceImportLogData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    @Input() mode: MODE_PAGE;

    @Input() lang: string;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private financialManagementService: FinancialManagementService,
        private courseManagementService: CourseManagementService
    ) {}

    ngOnInit(): void {
        this.loadModel();
        this.fetchData();
    }
    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.loadModel();
            this.fetchData();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }
    onBack() {
        console.log('back :>> ');
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        console.log('close :>> ', event);
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    loadModel() {
        this.courseManagementService.getCoursepublicMain(this.item.coursepublicId).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.initForm = true;
                this.coursepublicMain = result.entries;
            }
        });
    }

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: FinanceImportDetailData = {
            impId: this.item.impId,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
            if (event.rows !== this.rows) {
                this.backToFirstPage();
            }
        } else {
            this.backToFirstPage();
        }

        this.financialManagementService
            .findFinanceImportDetail(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.initForm = true;
                    this.items = entries;
                    this.totalRecords = totalRecords;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
    }
}
