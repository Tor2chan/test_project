import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { ReportOfferedCourseData } from 'src/app/models/report/reportOfferedCourseData';
import { DropdownService } from 'src/app/services/dropdown.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
  selector: 'app-offered-course-report',
  templateUrl: './offered-course-report.component.html',
  styleUrls: ['./offered-course-report.component.scss']
})
export class OfferedCourseReportComponent implements OnInit,DoCheck {

    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    items: ReportOfferedCourseData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    statusList: DropdownData[] = [];
    courseMappingStatusList: DropdownData[];

    clickYearStart: boolean = false;
    clickYearEnd: boolean = false;

    criteria: ReportOfferedCourseData = {
        depNameShortTh: null,
        fullCourseTh: null,
        courseStatus: null,
        sendDateStart: null,
        sendDateEnd: null,
        courseMappingStatus: null,
        first: 0,
        size: 5,
        mode: 'search'
    }

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private reportService: ReportService
    ) {
    }

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onSearch();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.courseMappingStatusList = [
                { value: true, nameTh: this.translate.instant('master.courseType.criteria.compareMapping') },
                { value: false, nameTh: this.translate.instant('master.courseType.criteria.uncompareMapping') },
                { value: null, nameTh: this.translate.instant('common.status.all') }
            ];
        }

    }

    ngOnInit(): void {
        this.loadDropDown();
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.COURSE_STATUS
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
            depNameShortTh: null,
            fullCourseTh: null,
            courseStatus: null,
            sendDateStart: null,
            sendDateEnd: null,
            courseMappingStatus: null,
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

        this.reportService.findOfferedCourseReport(this.criteria).subscribe((result) => {
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

        this.reportService.findOfferedCourseReport(this.criteria).subscribe(({ status, message, entries}) => {
            this.loaderService.stop();
            if (status === 200) {
                console.log('export')

                var link = document.createElement("a");
                    document.body.appendChild(link);
                    link.setAttribute("type", "hidden");
                    link.href = "data:application/octet-stream;charset=utf-8;base64," + entries;
                    //console.log('entries :>> ', entries);
                    link.download = `รายงานคอร์สที่เปิดสอนเพื่อขออนุมัติโครงการ-${new Date().toJSON().slice(0,10).replace(/-/g,'')}.xlsx`;
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
