import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DropdownData, LOOKUP_CATALOG, DropdownCriteriaData } from 'src/app/models/common';
import { CourseMainData } from 'src/app/models/course-management';
import { DropdownService } from 'src/app/services/dropdown.service';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { ToastCloseEvent } from 'primeng/toast';
import { AutUserData } from 'src/app/models/user-management';
@Component({
    selector: 'app-detail-of-the-short-training-course',
    templateUrl: './detail-of-the-short-training-course.component.html',
    styleUrls: ['./detail-of-the-short-training-course.component.scss']
})
export class DetailOfTheShortTrainingCourseComponent implements OnInit, DoCheck {

    @Input() courseMain!: CourseMainData;

    @Input() lang: string;

    initForm: boolean = false;
    processing: boolean = false;
    showError: boolean = false;

    courseStatusList: DropdownData[] = [];
    courseTypeList: DropdownData[] = [];
    departmentLevel1List: DropdownData[] = [];
    departmentLevel2List: DropdownData[] = [];
    userList: DropdownData[];
    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();

    accessLevel: number | null;
    clickYear: boolean = false;

    //Non >> after config calendar check (saving logic)
    // date: Date | undefined;
    // currentDate = new Date();
    // minDate :Date = new Date(this.currentDate.getFullYear()-13, this.currentDate.getMonth(), this.currentDate.getDate());
    // [maxDate]="minDate"
    // [defaultDate]="minDate"

    /** course main  , course log*/

    constructor(
        private route: ActivatedRoute,
        private dropdownService: DropdownService,
        private messageService: MessageService,
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {
        const user: AutUserData = JSON.parse(localStorage.getItem('user')) ?? {};
        const { accessLevel } = user;
        this.accessLevel = accessLevel;
    }

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.clickYear = false;
        }

    }
    ngOnInit(): void {
        if (!this.courseMain.requestDate) {
        this.courseMain.requestDate = new Date();
        }
        setTimeout(() => {
            this.lazyLoadCourseType(null, this.courseMain.courseTypeId);
            this.loadDropDown();
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

        if (this.courseMain.createById) {
            this.dropdownService
                .getUserDropdown({
                    displayCode: false,
                    pkId: this.courseMain.createById
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.userList = entries;
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


        setTimeout(() => {
            this.lazyLoadDepartmentLevel1(null, this.courseMain.depIdLevel1);
            this.lazyLoadDepartmentLevel2(null, this.courseMain.depIdLevel2);
            this.lazyLoadCourseType(null, this.courseMain.courseTypeId);

        }, 100);
    }

    lazyLoadCourseType(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getCourseTypeDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.courseTypeList = this.getUniqueListBy([
                    ...this.courseTypeList,
                    ...entries
                ], 'value')
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(message),
                    life: 2000
                });
            }
        });

        // this.dropdownService.getCourseTypeDropdown({
        //         displayCode: true
        //     })
        //     .subscribe(({ status, message, entries }) => {
        //         if (status === 200) {
        //             this.courseTypeList = this.getUniqueListBy([
        //                 ...this.courseTypeList,
        //                 ...entries
        //             ], 'value');
        //         } else {
        //             this.messageService.add({
        //                 severity: 'error',
        //                 summary: this.translate.instant('common.alert.fail'),
        //                 detail: message,
        //                 life: 2000
        //             });
        //         }
        //     });
    }

    getUniqueListBy(arr: any[], key) {
        return [...new Map(arr.map(item => [item[key], item])).values()]
    }

    lazyLoadDepartmentLevel1(event?: DropdownFilterEvent, pkId?: number) {
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
                this.departmentLevel1List = this.getUniqueListBy([
                    ...this.departmentLevel1List,
                    ...entries
                ], 'value')
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

    lazyLoadDepartmentLevel2(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009002,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (this.courseMain.depIdLevel1) {
            dropdownCriteriaData.id = this.courseMain.depIdLevel1;
        } else {
            this.departmentLevel2List = [];
            return;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLevel2List = this.getUniqueListBy([
                    ...this.departmentLevel2List,
                    ...entries
                ], 'value')
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

        if (!!!this.courseMain.courseTypeId
            || !!!this.courseMain.depIdLevel1
            || !!!this.courseMain.depIdLevel2
            || !!!this.courseMain.courseNameTh
            || !!!this.courseMain.courseNameEn
            || !!!this.courseMain.courseDescTh
            || !!!this.courseMain.courseDescEn
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


        if (this.courseMain.courseId) {
            this.courseManagementService.putCourseMain(this.courseMain.courseId, this.courseMain)
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
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            })
        } else {
            this.courseManagementService.postCourseMain(this.courseMain)
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {

                    localStorage.setItem('course', '' + entries.courseId);

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
            })
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
