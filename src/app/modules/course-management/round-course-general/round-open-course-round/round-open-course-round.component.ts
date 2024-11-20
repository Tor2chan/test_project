import { DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { ToastCloseEvent } from 'primeng/toast';

@Component({
    selector: 'app-round-open-course-round',
    templateUrl: './round-open-course-round.component.html',
    styleUrls: ['./round-open-course-round.component.scss']
})
export class RoundOpenCourseRoundComponent implements OnInit, DoCheck {
    initForm: boolean = false;
    processing: boolean = false;
    showError: boolean = false;

    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() lang: string;

    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();

    certificateFormatList: DropdownData[] = [];
    publicFormatList: DropdownData[] = [];

    clickCourseClassStart: boolean = false;
    clickCourseClassEnd: boolean = false;
    clickCoursePublicStart: boolean = false;
    clickCoursePublicEnd: boolean = false;
    clickCourseRegisStart: boolean = false;
    clickCourseRegisEnd: boolean = false;

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {}
    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = true;
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.clickCourseClassStart = false;
            this.clickCourseClassEnd = false;
            this.clickCoursePublicStart = false;
            this.clickCoursePublicEnd = false;
            this.clickCourseRegisStart = false;
            this.clickCourseRegisEnd = false;
        }
    }

    ngOnInit(): void {
        this.loadDropDown();
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.CERTIFICATE_ISSUANCE_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.certificateFormatList = entries;
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
                id: LOOKUP_CATALOG.COURSE_ENROLLMENT_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.publicFormatList = entries;
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
    onSave() {
        this.processing = true;
        this.loaderService.start();

        if (this.coursepublicMain.publicFormat === 30007001) {
            this.coursepublicMain.buasriStatus = false;
        }

        if (this.coursepublicMain.publicFormat === 30007002) {
            if (
                // !!!this.coursepublicMain.certificateFormat ||
                !!!this.coursepublicMain.coursePublicStart ||
                !!!this.coursepublicMain.courseRegisStart ||
                !!!this.coursepublicMain.courseClassStart ||
                !!!this.coursepublicMain.coursePublicEnd ||
                !!!this.coursepublicMain.courseRegisEnd ||
                !!!this.coursepublicMain.courseClassEnd
            ) {
                this.showError = true;
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant('common.pleaseEnter'),
                    life: 2000
                });
                this.loaderService.stop();
                return;
            }
        } else {
            if (
                // !!!this.coursepublicMain.certificateFormat ||
                !!!this.coursepublicMain.coursePublicStart ||
                !!!this.coursepublicMain.courseRegisStart ||
                !!!this.coursepublicMain.courseClassStart ||
                !!!this.coursepublicMain.maxEnroll
            ) {
                this.showError = true;
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant('common.pleaseEnter'),
                    life: 2000
                });
                this.loaderService.stop();
                return;
            }
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
        this.backToList.emit('LIST');
    }
    onChangePublicFormat() {
        /** รูปแบบการเปิดหลักสูตร 30007001 เปิดตลอด */
        if (this.coursepublicMain.publicFormat === 30007001) {
            this.coursepublicMain.coursePublicEnd = null;
            this.coursepublicMain.courseRegisEnd = null;
            this.coursepublicMain.courseClassEnd = null;
        }
    }

    onClose(event: ToastCloseEvent) {
        if (
            event.message.severity === 'success' ||
            event.message.severity === 'warn' ||
            event.message.severity === 'error'
        ) {
            this.processing = false;
        }
    }

    changeClearDateAll() {
        this.coursepublicMain.coursePublicEnd = null;
        this.coursepublicMain.courseRegisStart = null;
        this.coursepublicMain.courseRegisEnd = null;
        this.coursepublicMain.courseClassStart = null;
        this.coursepublicMain.courseClassEnd = null;
    }

    changeClearRegisEndAndClass() {
        this.coursepublicMain.courseRegisEnd = null;
        this.coursepublicMain.courseClassStart = null;
        this.coursepublicMain.courseClassEnd = null;
    }

    changeClearClassEnd() {
        this.coursepublicMain.courseClassEnd = null;
    }

}
