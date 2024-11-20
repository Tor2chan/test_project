import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
  selector: 'app-view-teaching-format',
  templateUrl: './view-teaching-format.component.html',
  styleUrls: ['./view-teaching-format.component.scss']
})
export class ViewTeachingFormatComponent implements OnInit {

    @Input() lang: string;
    @Input() courseMain: CourseMainData;

    courseFormatList: DropdownData[] = [];
    unitsOfTimeList: DropdownData[] = [];
    gradeFormatList: DropdownData[] = [];

    initForm: boolean = false;

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // this.fetchData();
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);

        setTimeout(() => {
            this.initForm = true;
        }, 200);
        this.loadDropDown();
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.TEACHING_CONCEPT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.courseFormatList = entries;
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
                id: LOOKUP_CATALOG.UNITS_OF_TIME
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.unitsOfTimeList = entries;
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
                id: LOOKUP_CATALOG.TRANSCRIPT_OF_ACADEMIC_PERFORMANCE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.gradeFormatList = entries;
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

    calCourseTotal() {
        const courseTheoryH = this.courseMain.courseTheoryH ? this.courseMain.courseTheoryH : 0;
        const courseActionH = this.courseMain.courseActionH ? this.courseMain.courseActionH : 0;
        this.courseMain.courseTotalH = Number(courseTheoryH) + Number(courseActionH);
    }

    onChangeTimeUnit(event: DropdownChangeEvent) {
        const courseTotalH = this.courseMain.courseTotalH ? this.courseMain.courseTotalH : 0;
        if (courseTotalH === 0) {
            this.courseMain.courseDurationTime = 0;
            return;
        }
        if (event.value === 30004001) {
            console.log('1 :>> ', 1);
            this.courseMain.courseDurationTime = courseTotalH / 24;
        } else if (event.value === 30004002) {
            this.courseMain.courseDurationTime = courseTotalH / (24 * 7);
        } else if (event.value === 30004003) {
            this.courseMain.courseDurationTime = courseTotalH / (24 * 30);
        }
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
