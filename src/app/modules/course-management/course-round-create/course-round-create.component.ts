import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownFilterEvent } from 'primeng/dropdown';

@Component({
    selector: 'app-course-round-create',
    templateUrl: './course-round-create.component.html',
    styleUrls: ['./course-round-create.component.scss']
})
export class CourseRoundCreateComponent {
    mode: MODE_PAGE = 'LIST';

    tempMediaLink: any;

    coursepublicMain: CoursepublicMainData = {
        activeFlag: true
    };

    @Input() lang: string;

    courseMainList: DropdownData[] = [];

    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();

    constructor(
        private dropdownService: DropdownService,
        private messageService: MessageService,
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {}

    ngOnInit(): void {
        this.lazyLoadCourseMain(null);
    }

    lazyLoadCourseMain(event: DropdownFilterEvent, pkId?: number) {
        /** หลักสูตรที่ผ่านการอนุมัติแล้ว */
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true,
            id: 30010005
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getCourseMainDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.courseMainList = entries;
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
        this.courseManagementService.postCoursepublicMain(this.coursepublicMain).subscribe(({ status, message, entries }) => {
            this.loaderService.stop();
            if (status === 200) {
                localStorage.setItem('coursepublic', '' + entries.coursepublicId);
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.alert.success'),
                    detail: message,
                    life: 2000
                });
                // this.afterSaveCourseMain.emit();
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

    onBack() {
        this.backToList.emit();
    }
}
