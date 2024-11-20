import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { ReportEnrollmentAndPaymentData } from 'src/app/models/report/reportEnrollmentAndPaymentData';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-enrollment-and-payment-report',
  templateUrl: './enrollment-and-payment-report.component.html',
  styleUrls: ['./enrollment-and-payment-report.component.scss']
})
export class EnrollmentAndPaymentReportComponent implements OnInit, DoCheck{

    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    items: ReportEnrollmentAndPaymentData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    criteria: ReportEnrollmentAndPaymentData = {
        depNameShortTh: null,
        fullCourseTh: null,
        registerDateStart: null,
        registerDateEnd: null,
        first: 0,
        size: 5,
        mode: 'search'
    }

    clickYearStart: boolean = false;
    clickYearEnd: boolean = false;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private reportService: ReportService

    ){

    }

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

    }


    onClear() {
        this.criteria = {
            depNameShortTh: null,
            fullCourseTh: null,
            registerDateStart: null,
            registerDateEnd: null,
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

        this.reportService.findEnrollmentAndPaymentReport(this.criteria).subscribe((result) => {
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

        this.reportService.findEnrollmentAndPaymentReport(this.criteria).subscribe(({ status, message, entries}) => {
            this.loaderService.stop();
            if (status === 200) {
                console.log('export')

                var link = document.createElement("a");
                    document.body.appendChild(link);
                    link.setAttribute("type", "hidden");
                    link.href = "data:application/octet-stream;charset=utf-8;base64," + entries;
                    //console.log('entries :>> ', entries);
                    link.download = `รายงานตรวจสอบจำนวนผู้เรียนและจำนวนเงินที่ได้รับ-${new Date().toJSON().slice(0,10).replace(/-/g,'')}.xlsx`;
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
