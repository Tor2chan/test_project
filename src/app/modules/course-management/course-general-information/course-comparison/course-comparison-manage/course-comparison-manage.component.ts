import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { CourseMainData, CourseMatchingData, SwuCurriculumData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-course-comparison-manage',
    templateUrl: './course-comparison-manage.component.html',
    styleUrls: ['./course-comparison-manage.component.scss']
})
export class CourseComparisonManageComponent implements OnInit {
    initForm: boolean = false;
    showError: boolean = false;
    processing: boolean = false;
    visible: boolean = false;

    @Input() courseMain: CourseMainData;

    @Input() items: CourseMatchingData[];

    @Input() mode: MODE_PAGE;

    @Input() lang: string;

    criteria: SwuCurriculumData = {
        curriculumSwuId: null,
        curriculumNameTh: null,
        subjectCodeTh: null,
        subjectNameTh: null,
        ownerDepNameTh: null,
        searchFormat: 30037001,
        first: 0,
        size: 5
    };
    totalRecords: number = 0;

    rows: number = 5;

    datas: SwuCurriculumData[] = [];
    selectDatas: SwuCurriculumData[] = [];

    courseMatchingList: CourseMatchingData[] = [];

    detailSubject: SwuCurriculumData[] = [];

    searchFormatList: DropdownData[] = [];

    @Output() backToListPage = new EventEmitter();

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private dropdownService: DropdownService
    ) {
        this.initForm = true;
    }
    ngOnInit(): void {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.SEARCH_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.searchFormatList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });

        this.fetchData();
    }

    onClear() {
        this.criteria = {
            curriculumSwuId: null,
            curriculumNameTh: null,
            subjectCodeTh: null,
            subjectNameTh: null,
            ownerDepNameTh: null,
            searchFormat: 30037001,
            first: 0,
            size: 5
        };
        this.fetchData();
    }

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    getUniqueListBy(arr: any[], key) {
        return [...new Map(arr.map((item) => [item[key], item])).values()];
    }

    fetchData(event?: TablePageEvent) {
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

        this.courseManagementService
            .findSwuCurriculum(this.criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.datas = entries;
                    this.totalRecords = totalRecords;

                    setTimeout(() => {
                        this.selectDatas = this.getUniqueListBy([...this.selectDatas, ...this.items], 'subjectKey');
                    }, 200);
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

    onSave() {
        this.loaderService.start();
        this.processing = true;
        this.selectDatas.forEach((data) => {
            this.courseMatchingList = [
                ...this.courseMatchingList,
                {
                    courseId: this.courseMain.courseId,
                    courseMatchingId: null,
                    curriculumSwuId: data.curriculumSwuId,
                    subjectSwuId: data.subjectSwuId,
                    subjectKey: data.subjectKey,
                    subjectSet: data.subjectSet,
                    activeFlag: true
                }
            ];
        });

        this.courseManagementService
            .putCourseMatchingCourse(this.courseMain.courseId, this.courseMatchingList)
            .subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                    setTimeout(() => {
                        this.backToListPage.emit('LIST');
                    }, 1500);
                } else if (result.status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(result.message),
                        life: 2000
                    });
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
    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
            this.processing = false;
        }
    }

    showDetail(subjectKey: string) {
        this.visible = true;

        const criteria: SwuCurriculumData = {
            subjectKey: subjectKey
        };

        this.courseManagementService
            .findSwuCurriculum(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.detailSubject = entries;
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
