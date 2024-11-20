import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownData, MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { DropdownService } from 'src/app/services/dropdown.service';
import { ReportDepartmentIncomeDetailData } from 'src/app/models/report/reportDepartmentIncomeDetailData';
import { ReportService } from 'src/app/services/report.service';

@Component({
    selector: 'app-detail-department-income-report',
    templateUrl: './detail-department-income-report.component.html',
    styleUrls: ['./detail-department-income-report.component.scss']
})
export class DetailDepartmentIncomeReportComponent implements OnInit, DoCheck {
    processing: boolean = false;
    initForm: boolean = false;

    coursepublicMain: CoursepublicMainData;

    @Output() backToListPage = new EventEmitter();
    @Input() item!: ReportDepartmentIncomeDetailData;

    @Input() mode: MODE_PAGE;

    @Input() lang: string;

    items: ReportDepartmentIncomeDetailData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    coursepublicMaintList: DropdownData[] = [];
    coordinatorList: DropdownData[] = [];

    criteria: ReportDepartmentIncomeDetailData = {
        depIdLevel1: null,
        registerDateStart: null,
        registerDateEnd: null,
        coordinatorTh: null,
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
        private reportService: ReportService,
        private dropdownService: DropdownService
    ) {}

    ngOnInit(): void {
        this.lazyLoadCoursepublicMain();
        this.fetchData();
    }
    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchData();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    lazyLoadCoursepublicMain(event?: DropdownFilterEvent, id?: number) {
        // let dropdownCriteriaData: DropdownCriteriaData = {
        //     // depType: 30009001,
        //     displayCode: true
        // };
        // if (event && event.filter) {
        //     dropdownCriteriaData.searchValue = event.filter;
        // }
        // this.dropdownService.getCoursepublicMainDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
        //     if (status === 200) {
        //         this.coordinatorList = entries;
        //     } else {
        //         this.messageService.add({
        //             severity: 'error',
        //             summary: this.translate.instant('common.alert.fail'),
        //             detail: this.translate.instant(message),
        //             life: 2000
        //         });
        //     }
        // });
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

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    // loadModel() {
    //     this.courseManagementService.getCoursepublicMain(this.item.coursepublicId).subscribe((result) => {
    //         this.loaderService.stop();
    //         if (result.status === 200) {
    //             this.initForm = true;
    //             this.coursepublicMain = result.entries;
    //         }
    //     });
    // }

    onClear() {
        this.criteria = {
            depIdLevel1: null,
            registerDateStart: null,
            registerDateEnd: null,
            first: 0,
            size: 5,
            mode: 'search'
        };
        this.fetchData();
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: ReportDepartmentIncomeDetailData = {
            depIdLevel1: this.item.depId,
            registerDateStart: this.criteria.registerDateStart,
            registerDateEnd: this.criteria.registerDateEnd,
            coordinatorTh: this.criteria.coordinatorTh,
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

        this.reportService
            .findDetailDepartmentIncome(criteria)
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

    onExport() {
        this.loaderService.start();
        this.criteria.mode = 'excelbase64';
        this.criteria.depIdLevel1 = this.item.depId;

        this.reportService.findDetailDepartmentIncome(this.criteria).subscribe(({ status, message, entries }) => {
            this.loaderService.stop();
            if (status === 200) {
                console.log('export');

                var link = document.createElement('a');
                document.body.appendChild(link);
                link.setAttribute('type', 'hidden');
                link.href = 'data:application/octet-stream;charset=utf-8;base64,' + entries;
                //console.log('entries :>> ', entries);
                link.download = `รายงานรายละเอียดยอดโอนจัดสรรคืนคณะ-${new Date()
                    .toJSON()
                    .slice(0, 10)
                    .replace(/-/g, '')}.xlsx`;
                link.click();
                document.body.removeChild(link);
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
}
