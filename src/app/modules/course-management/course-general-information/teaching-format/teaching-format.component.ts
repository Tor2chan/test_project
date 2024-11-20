import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { RadioButtonClickEvent } from 'primeng/radiobutton';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-teaching-format',
    templateUrl: './teaching-format.component.html',
    styleUrls: ['./teaching-format.component.scss']
})
export class TeachingFormatComponent implements OnInit {
    @Input() courseMain!: CourseMainData;

    @Input() lang: string;

    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();


    processing: boolean = false;
    showError: boolean = false;

    courseFormatList: DropdownData[] = [];
    unitsOfTimeList: DropdownData[] = [];
    gradeFormatList: DropdownData[] = [];

    /** course main */

    constructor(
        private translate: TranslateService,
        private dropdownService: DropdownService,
        private messageService: MessageService,
        private courseManagementService: CourseManagementService,
        private loaderService: NgxUiLoaderService
    ) {}

    categories: any[] = [
        { nameTh: 'มีการวัดผล/ให้คะแนน/ประเมิน', nameEn: 'Evaluation', value: true },
        { nameTh: 'ไม่มีการวัดผล เน้นการเข้าร่วมเท่านั้น', nameEn: 'Non-Evaluation', value: false }
    ];

    showErrorTheory: boolean = false;
    showErrorAction: boolean = false;

    checkInput(type: string) {
        if (type === 'theory') {
            this.showErrorTheory = !!!this.courseMain.courseTheoryH || isNaN(this.courseMain.courseTheoryH);
        } else if (type === 'action') {
            this.showErrorAction = !!!this.courseMain.courseActionH || isNaN(this.courseMain.courseActionH);
        }
    }

    ngOnInit(): void {
        this.loadDropDown();
        setTimeout(() => {
            if (!this.courseMain.gradeFormat) {
                /** สัญลักษณ์ ( S, U ) */
                this.courseMain.gradeFormat = 30005001;
            }
        }, 500);
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

    onSave() {
        this.processing = true;
        this.loaderService.start();
          // ตรวจสอบว่าข้อมูลที่ป้อนเข้ามาเป็นตัวเลขหรือไม่
        const isCourseTheoryNumeric = !isNaN(this.courseMain.courseTheoryH);
        const isCourseActionNumeric = !isNaN(this.courseMain.courseActionH);

        // ตรวจสอบว่าข้อมูลที่ป้อนมาเป็นตัวเลขหรือไม่
        if (!isCourseTheoryNumeric || !isCourseActionNumeric) {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('ใส่ตัวเลข'),
                life: 2000
            });
            this.loaderService.stop();
            return;
        }

        if (this.courseMain.gradeFormat == 30005001) {

            if (!!!this.courseMain.courseFormat
                || !!!this.courseMain.courseFormatDescTh
                || !!!this.courseMain.courseFormatDescEn
                || (!!!this.courseMain.courseTheoryH && this.courseMain.courseTheoryH !== 0)
                || (!!!this.courseMain.courseActionH && this.courseMain.courseActionH !== 0)
                || !!!this.courseMain.courseDurationTime
                || !!!this.courseMain.durationTimeUnit
                || !!!this.courseMain.gradeFormat
                || (!!!this.courseMain.creditAmount && this.courseMain.creditAmount !== 0)
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

            if (!!!this.courseMain.courseFormat
                || !!!this.courseMain.courseFormatDescTh
                || !!!this.courseMain.courseFormatDescEn
                || (!!!this.courseMain.courseTheoryH && this.courseMain.courseTheoryH !== 0)
                || (!!!this.courseMain.courseActionH && this.courseMain.courseActionH !== 0)
                || !!!this.courseMain.courseDurationTime
                || !!!this.courseMain.durationTimeUnit
                || !!!this.courseMain.gradeFormat
                || (!!!this.courseMain.creditAmount && this.courseMain.creditAmount !== 0)
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

        if (this.courseMain.courseId) {
            this.courseManagementService
                .putCourseMain(this.courseMain.courseId, this.courseMain)
                .subscribe(({ status, message, entries }) => {
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
                    }
                });
        }
    }

    onBack() {
        console.log('back')
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
