import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { ReportDepartmentIncomeData } from 'src/app/models/report/reportDepartmentIncomeData';
import { DropdownService } from 'src/app/services/dropdown.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-department-income-report',
  templateUrl: './department-income-report.component.html',
  styleUrls: ['./department-income-report.component.scss']
})
export class DepartmentIncomeReportComponent {

    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    items: ReportDepartmentIncomeData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: ReportDepartmentIncomeData;
    coursepublicMaintList: DropdownData[] = [];
    fiscalYearList: DropdownData[] = [];

    criteria: ReportDepartmentIncomeData = {
        resultDateList: null,
        depNameShortTh: null,
        registerDateStart: null,
        registerDateEnd: null,
        bdgYear: null,
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
        private reportService: ReportService,
        private dropdownService: DropdownService
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
        this.lazyLoadCoursepublicMain();
        this.lazyLoadFiscalYear();
    }


    lazyLoadCoursepublicMain(event?: DropdownFilterEvent, id?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            // depType: 30009001,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getCoursepublicMainDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.coursepublicMaintList = entries;
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


    lazyLoadFiscalYear(event?: DropdownFilterEvent, id?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            // depType: 30009001,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getFiscalYearDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.fiscalYearList = entries;
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

    onClear() {
        this.criteria = {
            resultDateList: null,
            depNameShortTh: null,
            registerDateStart: null,
            registerDateEnd: null,
            first: 0,
            size: 5,
            mode: 'search'
        }
        this.onSearch();
    }

    showDetail(page: MODE_PAGE, id?: number) {
        console.log('MODE_PAGE :>> ', page);
        console.log('depId :>> ', id);
        if (page == 'CREATE') {
            this.editData = {
                depId: null,
                resultDateList: null,
                depNameShortTh: null,
                registerDateStart: null,
                registerDateEnd: null,
                bdgYear: null,
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'VIEW') {
            this.loaderService.start();
            this.reportService.getDetailDepartmentIncome(id).subscribe((result) => {
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

        this.reportService.findDepartmentIncomeReport(this.criteria).subscribe((result) => {
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

        this.reportService.findDepartmentIncomeReport(this.criteria).subscribe(({ status, message, entries}) => {
            this.loaderService.stop();
            if (status === 200) {
                console.log('export')

                var link = document.createElement("a");
                    document.body.appendChild(link);
                    link.setAttribute("type", "hidden");
                    link.href = "data:application/octet-stream;charset=utf-8;base64," + entries;
                    //console.log('entries :>> ', entries);
                    link.download = `รายงานสรุปยอดโอนจัดสรรคืนคณะ-${new Date().toJSON().slice(0,10).replace(/-/g,'')}.xlsx`;
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
