import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-round-location-and-study-location',
    templateUrl: './round-location-and-study-location.component.html',
    styleUrls: ['./round-location-and-study-location.component.scss']
})
export class RoundLocationAndStudyLocationComponent implements OnInit {
    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() lang: string;

    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();

    initForm: boolean = false;
    processing: boolean = false;
    showError: boolean = false;

    courseFormatList: DropdownData[] = [];
    courseTypeList: DropdownData[] = [];
    departmentList: DropdownData[] = [];

    constructor(
        private dropdownService: DropdownService,
        private messageService: MessageService,
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {}

    ngOnInit(): void {
        this.loadDropDown();
        setTimeout(() => {
            // this.lazyLoadDepartment(null, this.coursepublicMain.depId);
            this.initForm = true;
        }, 100);
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
    }

    /*
    lazyLoadDepartment(event: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009001,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentList = entries;
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
    */

    onSave() {
        this.processing = true;
        this.loaderService.start();

        if (!!!this.coursepublicMain.courseFormat
            || !!!this.coursepublicMain.courseFormatDescTh
            || !!!this.coursepublicMain.courseFormatDescEn
        ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            // this.processing = false;
            this.loaderService.stop();
            return;
        }

        if (this.coursepublicMain.coursepublicId) {
            this.courseManagementService
                .putCoursepublicMain(this.coursepublicMain.coursepublicId, this.coursepublicMain)
                .subscribe(({ status, message }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: message,
                            life: 2000
                        });
                        this.afterSaveCourseMain.emit();
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

    onBack() {
        this.backToList.emit();
    }

    onClose(event: ToastCloseEvent) {
        if (    event.message.severity === 'success'
             || event.message.severity === 'warn'
             || event.message.severity === 'error'
           ) {
            this.processing = false;
        }
    }
}
