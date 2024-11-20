import { HttpClient } from '@angular/common/http';
import { Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { MODE_PAGE } from 'src/app/models/common';
import { FinanceImportLogData } from 'src/app/models/financial-management/financeImportLogData';
import { FinancialManagementService } from 'src/app/services/financial-management.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
    selector: 'app-payment-import',
    templateUrl: './payment-import.component.html',
    styleUrls: ['./payment-import.component.scss']
})
export class PaymentImportComponent implements OnInit, DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    items: FinanceImportLogData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: FinanceImportLogData;
    clickYear: boolean = false;

    criteria: FinanceImportLogData = {
        impId: null,
        createDate: null,
        impFileName: null,
        publicNameTh: null,
        fileReferenceCode: null,
        first: 0,
        size: 5
    };

    constructor(
        public translate: TranslateService,
        private financialManagementService: FinancialManagementService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private router: Router,
        private reportService: ReportService,
        private readonly http: HttpClient,
        private globalService: GlobalService
    ) {}

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onSearch();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit(): void {}

    onClear() {
        this.criteria = {
            impId: null,
            createDate: null,
            impFileName: null,
            publicNameTh: null,
            fileReferenceCode: null,
            first: 0,
            size: 5
        };
        this.onSearch();
    }

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    onSearch(event?: TablePageEvent) {
        this.loaderService.start();

        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
            if (event.rows !== this.rows) {
                this.backToFirstPage();
            }
        } else {
            this.backToFirstPage();
        }

        this.financialManagementService.findFinanceImportLog(this.criteria).subscribe((result) => {
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

    openPage(event: MODE_PAGE) {
        if (event === 'CREATE') {
            this.router.navigate(['/financial-management/payment-import/import']);
        }
    }

    showDetail(page: MODE_PAGE, id?: number) {
        console.log('MODE_PAGE :>> ', page);
        console.log('impId :>> ', id);
        if (page == 'CREATE') {
            this.editData = {
                impId: null,
                createDate: null,
                impFileName: null,
                publicNameTh: null,
                fileReferenceCode: null
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'VIEW') {
            this.loaderService.start();
            this.financialManagementService.getFinanceImportLog(id).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.editData = result.entries;
                    this.mode = page;
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
    }

    downloadZip(item: FinanceImportLogData) {
        this.loaderService.start();
        this.reportService.downloaod(item.resultFileZip).subscribe({
            next: (result) => {
                this.loaderService.stop();
                if (result?.body && result?.headers) {
                    const data = window.URL.createObjectURL(result.body);
                    const filtname = item.resultFileZip.split('\/')[item.resultFileZip.split('\/').length - 1];
                    this.globalService.openTargetBlank(data, filtname);
                }
            },
            error: (err) => {
                const { status, messages } = err;
                if (messages) {
                    const messageLog = [, , messages];
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: `${messages}`,
                        life: 2000
                    });
                }
            }
        });
    }
}
