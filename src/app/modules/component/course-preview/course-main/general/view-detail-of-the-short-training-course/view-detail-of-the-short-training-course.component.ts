import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-view-detail-of-the-short-training-course',
    templateUrl: './view-detail-of-the-short-training-course.component.html',
    styleUrls: ['./view-detail-of-the-short-training-course.component.scss']
})
export class ViewDetailOfTheShortTrainingCourseComponent implements OnInit, AfterViewInit {
    @Input() lang: string;
    @Input() courseMain!: CourseMainData;

    initForm: boolean = false;

    courseStatusList: DropdownData[] = [];
    courseTypeList: DropdownData[] = [];
    departmentLevel1List: DropdownData[] = [];
    departmentLevel2List: DropdownData[] = [];

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService
    ) {}
    ngAfterViewInit(): void {
        this.loadDropDown();
    }

    ngOnInit(): void {
        // this.fetchData();
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);

        setTimeout(() => {
            this.initForm = true;
        }, 200);
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.STATUS_OF_SHORT_TERM_TRAINING_COURSES
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.courseStatusList = entries;
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
            .getCourseTypeDropdown({
                displayCode: true
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.courseTypeList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });
        this.lazyLoadDepartmentLevel1(null);
        this.lazyLoadDepartmentLevel2(null);
    }

    lazyLoadDepartmentLevel1(event: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009001,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }
        if (this.courseMain.depIdLevel1) {
            dropdownCriteriaData.pkId = this.courseMain.depIdLevel1;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLevel1List = entries;
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
    lazyLoadDepartmentLevel2(event: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009002,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }
        if (this.courseMain.depIdLevel2) {
            dropdownCriteriaData.pkId = this.courseMain.depIdLevel2;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLevel2List = entries;
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
    /*
    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: any = {
            courseId: this.courseMain.courseId,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseRequestAttach(criteria)
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
                        detail: message,
                        life: 2000
                    });
                }
            });
    }
    */
}
