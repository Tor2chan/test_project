import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { ReportEnrollmentListData } from 'src/app/models/report/reportEnrollmentListData';
import { DropdownService } from 'src/app/services/dropdown.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
    selector: 'app-enrollment-list-report',
    templateUrl: './enrollment-list-report.component.html',
    styleUrls: ['./enrollment-list-report.component.scss']
})
export class EnrollmentListReportComponent implements OnInit, DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    items: ReportEnrollmentListData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    paymentTypeList: DropdownData[] = [];
    statusList: DropdownData[] = [];
    clickReceiptDate: boolean = false;
    clictransactionDatetimeList: boolean = false;

    criteria: ReportEnrollmentListData = {
        fullCourseTh: null,
        fullNameTh: null,
        receiptNo: null,
        receiptDate: null,
        payType: null,
        transactionDatetime: null,
        studyStatus: null,
        receiptDateStart: null,
        receiptDateEnd: null,
        transactionDatetimeStart: null,
        transactionDatetimeEnd: null,
        first: 0,
        size: 5,
        mode: 'search'
    };

    clickYearStart: boolean = false;
    clickYearEnd: boolean = false;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private reportService: ReportService
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

    ngOnInit(): void {
        this.loadDropDown();
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: true,
                id: LOOKUP_CATALOG.PAYMENT_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.paymentTypeList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });

        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.ENROLLMENT_STATUS
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.statusList = entries;
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

    onClear() {
        this.criteria = {
            fullCourseTh: null,
            fullNameTh: null,
            receiptNo: null,
            receiptDate: null,
            payType: null,
            transactionDatetime: null,
            studyStatus: null,
            receiptDateStart: null,
            receiptDateEnd: null,
            transactionDatetimeStart: null,
            transactionDatetimeEnd: null,
            first: 0,
            size: 5,
            mode: 'search'
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

        this.reportService.findEnrollmentListReport(this.criteria).subscribe((result) => {
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

    onExport(){
        this.loaderService.start();
        this.criteria.mode = 'excelbase64';

        this.reportService.findEnrollmentListReport(this.criteria).subscribe(({ status, message, entries}) => {
            this.loaderService.stop();
            if (status === 200) {
                console.log('export')

                var link = document.createElement("a");
                    document.body.appendChild(link);
                    link.setAttribute("type", "hidden");
                    link.href = "data:application/octet-stream;charset=utf-8;base64," + entries;
                    //console.log('entries :>> ', entries);
                    link.download = `รายงานสรุปรายชื่อผู้ลงทะเบียนเรียน-${new Date().toJSON().slice(0,10).replace(/-/g,'')}.xlsx`;
                    link.click();
                    document.body.removeChild(link);

            }
            else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: message,
                    life: 2000
                })
            }
        })

    }

    onClose(event: ToastCloseEvent) {
        if (    event.message.severity === 'success'
             || event.message.severity === 'warn'
             || event.message.severity === 'error'
           ) {
        }
    }
}
