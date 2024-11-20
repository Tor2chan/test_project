import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { CourseActivityData, CourseActivityMethodData, CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-learning-management-process-manage',
    templateUrl: './learning-management-process-manage.component.html',
    styleUrls: ['./learning-management-process-manage.component.scss']
})
export class LearningManagementProcessManageComponent implements OnInit {
    showError: boolean = false;

    @Input() courseMain!: CourseMainData;
    @Input() item!: CourseActivityData;
    @Input() mode: MODE_PAGE;
    @Input() lang: string;

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;

    coursMethodList: DropdownData[] = [];

    // course_activity_method
    courseActivityMethodTemp: DropdownData[] = [];
    courseActivityMethodList: CourseActivityMethodData[] = [];

    constructor(
        public translate: TranslateService,
        private courseManagementService: CourseManagementService,
        private dropdownService: DropdownService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService
    ) {}

    ngOnInit(): void {
        this.lazyLoadMethod();
        setTimeout(() => {
            this.loadFkTable(this.item.courseActivityId);
        }, 150);
    }

    checkInputLength(inputText: string) {
        if (inputText && inputText.length > 1023) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('ข้อความมีความยาวเกิน 1023 ตัวอักษร'),
                life: 2000
            });
        } else {
            this.showError = false;         // ถ้าข้อความไม่เกิน 255 ตัวอักษร จะลบข้อความที่แสดงออก
            this.messageService.clear();    // ลบข้อความแจ้งเตือนที่แสดงออก
        }
    }

    lazyLoadMethod(event?: DropdownFilterEvent, pkIds?: number[], first?: boolean) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: false
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if ((pkIds || []).length > 0) {
            dropdownCriteriaData.pkIds = pkIds;
        }

        if (this.courseActivityMethodList.length > 0) {
            dropdownCriteriaData.pkIds = this.courseActivityMethodList.map(({ courseMethodId }) => courseMethodId);
        }

        if (this.courseActivityMethodTemp.length > 0) {
            dropdownCriteriaData.pkIds = this.courseActivityMethodTemp.map(({ value }) => value);
        }

        this.dropdownService.getMethodDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                let arr: DropdownData[] = [...this.coursMethodList, ...entries];
                const uniqueArr = arr.filter((obj, index) => {
                    return index === arr.findIndex((o) => obj.value === o.value);
                });

                this.coursMethodList = uniqueArr;
                if (first) {
                    const list = this.courseActivityMethodList.map(({ courseMethodId }) => courseMethodId);
                    this.courseActivityMethodTemp = this.coursMethodList.filter(({ value }) => list.includes(value));
                }
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
        this.processing = true;
        this.loaderService.start();

        // validate
        if (
            !!!this.item.courseActivityTopicTh ||
            !!!this.item.courseActivityTopicEn ||
            (this.courseActivityMethodTemp.length <= 0) ||
            (!!!this.item.courseActivityPeriod && this.item.courseActivityPeriod !== 0)||
            !!!this.item.courseActivityAssessTh ||
            !!!this.item.courseActivityAssessEn ||
            !!!this.courseActivityMethodTemp
            // !!!this.item.courseActivityId
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

        // this.coursMethodList = [];
        // this.courseActivityMethodTemp.forEach((catalogId) => {
        //     this.coursMethodList  = [
        //         ...this.coursMethodList ,
        //         {
        //         courseId: this.courseMain.courseId,
        //            targetGroupId: catalogId,
        //             activeFlag: true
        //         }
        //     ];
        // });

            // ตรวจสอบว่าข้อความมีความยาวเกิน 255 ตัวอักษร
        if (this.item.courseActivityTopicTh.length > 1023 ||
             this.item.courseActivityTopicEn.length > 1023 ||
             this.item.courseActivityAssessTh.length > 1023 ||
             this.item.courseActivityAssessEn.length > 1023
            ) {
                this.showError = true;
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant('ข้อความมีความยาวเกิน 1023 ตัวอักษร'),
                    life: 2000
                });
                this.loaderService.stop();
                return;
        }

        this.courseActivityMethodList =
            this.courseActivityMethodTemp.map(({ value }) => {
                return {
                    activeFlag: true,
                    courseId: this.courseMain.courseId,
                    courseMethodId: value
                };
            }) || [];

        this.item.courseActiviryMethodList = this.courseActivityMethodList;
        if (this.mode === 'CREATE') {
            this.courseManagementService.postCourseActivity(this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.item = result.entries;
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
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
        } else if (this.mode === 'EDIT') {

            this.courseManagementService
                .putCourseActivity(this.item.courseActivityId, this.item)
                .subscribe((result) => {
                    this.loaderService.stop();
                    if (result.status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: this.translate.instant('common.alert.textSuccess'),
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
        } else {
            console.log('else');
        }
    }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    loadFkTable(courseActivityId?: number) {
        if (!courseActivityId) return;
        this.courseManagementService
            .getCourseActivityMethodCourseActivity(courseActivityId)
            .subscribe(({ status, entries }) => {
                if (status === 200) {
                    this.courseActivityMethodList = entries;
                    this.lazyLoadMethod(null, null, true);
                }
            });
    }
}
