import { Component, DoCheck, OnInit, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MODE_PAGE, DropdownData, DropdownCriteriaData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CourseLogData, CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { CallBackData } from '../../component/card-list-common/card-list-common.component';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { DropdownService } from 'src/app/services/dropdown.service';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TablePageEvent } from 'primeng/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import { AutUserData } from 'src/app/models/user-management';
@Component({
    selector: 'app-course-management-list',
    templateUrl: './course-management-list.component.html',
    styleUrls: ['./course-management-list.component.scss']
})
export class CourseManagementListComponent implements DoCheck, OnInit {
    criteria: CourseMainData = {
        email: null,
        courseActionH: null,
        courseCode: null,
        courseDescEn: null,
        courseDescTh: null,
        courseDurationTime: null,
        courseFormat: null,
        courseFormatDescEn: null,
        courseFormatDescTh: null,
        courseMainStatus: null,
        courseNameEn: null,
        courseNameTh: null,
        courseSpecificRequirementEn: null,
        courseSpecificRequirementTh: null,
        courseTheoryH: null,
        courseTotalH: null,
        creditAmount: null,
        durationTimeUnit: null,
        forceStatus: false,
        gradeFormat: null,
        industryGroupId: null,
        targetGroupOtherName: null,
        targetGroupOtherStatus: null,
        activeFlag: null,
        first: 0,
        size: 5
    };
    initForm: boolean = false;
    visible: boolean = false;
    lang: string = 'th';
    statusList: CourseMainData;
    activeFlagList: DropdownData[] = [];
    courseFormatList: DropdownData[] = [];
    courseStatusList: DropdownData[] = [];
    courseTypeList: DropdownData[] = [];

    courseLogList: CourseLogData[] = [];

    departmentLevel1List: DropdownData[] = [];
    departmentLevel2List: DropdownData[] = [];

    totalRecords: number = 0;
    rows: number = 5;
    items: CourseMainData[] = [];

    mode: MODE_PAGE = 'LIST';

    forceStatus: boolean = false;

    courseId: number = 0;

    accessLevel: number | null;

    @Output() backToList = new EventEmitter();

    breadcrumItems: MenuItem[];

    constructor(
        private translate: TranslateService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {
        const user: AutUserData = JSON.parse(localStorage.getItem('user')) ?? {};
        const { accessLevel, depIdLevel1, depIdLevel2 } = user;
        this.accessLevel = accessLevel;
        if (this.accessLevel) {
            this.criteria.depIdLevel1 = depIdLevel1;
            this.criteria.depIdLevel2 = depIdLevel2;
        }

        this.breadcrumItems = [
            { label: this.translate.instant('menu.course.name'),
              command: () => this.openPage('LIST') },
            { label: this.translate.instant('menu.course.courseManagement.courseDraft'),
              routerLink: '/course-management/course-management-list' }
        ];
    }

    ngOnInit(): void {
        this.loadDropdown();
        setTimeout(() => {
            this.lazyLoadDepartmentLevel1();
            this.lazyLoadDepartmentLevel2();
        }, 200);
    }

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.activeFlagList = [
                { value: true, nameTh: this.translate.instant('common.status.active') },
                { value: false, nameTh: this.translate.instant('common.status.inActive') },
                { value: null, nameTh: this.translate.instant('common.status.all') }
            ];

            this.breadcrumItems = [
                { label: this.translate.instant('menu.course.name'),
                  command: () => this.openPage('LIST') },
                { label: this.translate.instant('menu.course.courseManagement.courseDraft'),
                  routerLink: '/course-management/course-management-list' }
            ];
        }
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onSearch();
        }
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

        this.courseManagementService.findCourseMain(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(result.message),
                    life: 2000
                });
            }
        });
    }
    onClear() {
        this.criteria = {
            courseActionH: null,
            courseCode: null,
            courseDescEn: null,
            courseDescTh: null,
            courseDurationTime: null,
            courseFormat: null,
            courseFormatDescEn: null,
            courseFormatDescTh: null,
            courseMainStatus: null,
            courseNameEn: null,
            courseNameTh: null,
            courseSpecificRequirementEn: null,
            courseSpecificRequirementTh: null,
            courseTheoryH: null,
            courseTotalH: null,
            creditAmount: null,
            durationTimeUnit: null,
            forceStatus: false,
            gradeFormat: null,
            industryGroupId: null,
            targetGroupOtherName: null,
            targetGroupOtherStatus: null,
            activeFlag: true,
            first: 0,
            size: 5
        };
        const user: AutUserData = JSON.parse(localStorage.getItem('user')) ?? {};
        const { depIdLevel1, depIdLevel2 } = user;
        if (this.accessLevel) {
            this.criteria.depIdLevel1 = depIdLevel1;
            this.criteria.depIdLevel2 = depIdLevel2;
        }
        this.onSearch();
    }
    onImport() {}
    onExport() {}

    callBack(event: CallBackData) {
        if (event.eventName === 'EDIT') {
            const data: CourseMainData = event.data;
            localStorage.setItem('course', '' + data.courseId);
            this.mode = 'EDIT';
        } else if (event.eventName === 'APPROVE') {
            const data: CourseMainData = event.data;
            localStorage.setItem('course', '' + data.courseId);
            this.mode = 'APPROVE';
        } else if (event.eventName === 'REQUEST') {
            const data: CourseMainData = event.data;
            localStorage.setItem('course', '' + data.courseId);
            this.mode = 'REQUEST';
        } else if (event.eventName === 'VIEW') {
            const data: CourseMainData = event.data;
            const { courseId } = data;
            const origin = window.location.origin;
            const id = {
                coursepublicId: null,
                courseId: courseId
            };
            const enc = window.btoa(JSON.stringify(id));
            setTimeout(() => {
                window.open(`${origin}/course-management/course-preview?data=${enc}`, '_blank');
            }, 50);
        } else if (event.eventName === 'DELETE') {
            const data: CourseMainData = event.data;

            // confirm
            this.confirmationService.confirm({
                key: 'confirm1',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.courseManagementService.deleteCourseMain(data.courseId).subscribe(({ status, message }) => {
                        this.loaderService.stop();
                        if (status === 200) {
                            this.messageService.add({
                                severity: 'success',
                                summary: this.translate.instant('common.alert.success'),
                                detail: this.translate.instant('common.alert.deleteSuccess'),
                                life: 2000
                            });
                            this.onClear();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: this.translate.instant('common.alert.fail'),
                                detail: message,
                                life: 2000
                            });
                        }
                    });
                },
                reject: () => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.reject'),
                        detail: this.translate.instant('common.alert.detailReject')
                    });
                }
            });
        } else if (event.eventName === 'COPY') {
            const data: CourseMainData = event.data;
            this.confirmationService.confirm({
                key: 'confirmCopy',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.loaderService.start();
                    this.courseManagementService.postCourseMainCopy(data).subscribe(({ status, message }) => {
                        this.loaderService.stop();
                        if (status === 200) {
                            this.messageService.add({
                                severity: 'success',
                                summary: this.translate.instant('common.alert.success'),
                                detail: message,
                                life: 2000
                            });
                            this.onClear();
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: this.translate.instant('common.alert.fail'),
                                detail: message,
                                life: 2000
                            });
                        }
                    });
                },
                reject: () => {
                    this.messageService.add({
                        severity: 'warn',
                        summary: this.translate.instant('common.button.cancel'),
                        detail: this.translate.instant('common.button.cancel')
                    });
                }
            });
        } else if (event.eventName === 'POPUPSTATUS') {
            console.log('POPUPSTATUS :>> ');
            this.visible = true;

            const data: CourseMainData = event.data;

            this.courseManagementService
            .getCourseLogTimeline(data.courseId)
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.courseLogList = entries;
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
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    }

    showPortal: boolean = false;

    getUniqueListBy(arr: any[], key) {
        return [...new Map(arr.map((item) => [item[key], item])).values()];
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

        if (this.criteria.depIdLevel1) {
            dropdownCriteriaData.pkId = this.criteria.depIdLevel1;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLevel1List = this.getUniqueListBy([...this.departmentLevel1List, ...entries], 'value');
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

        if (this.criteria.depIdLevel2) {
            dropdownCriteriaData.pkId = this.criteria.depIdLevel2;
        }

        if (this.criteria.depIdLevel1) {
            dropdownCriteriaData.id = this.criteria.depIdLevel1;
        } else {
            this.departmentLevel2List = [];
            return;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLevel2List = this.getUniqueListBy([...this.departmentLevel2List, ...entries], 'value');
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

    loadDropdown() {
        this.dropdownService
            .getLookup({ displayCode: false, id: LOOKUP_CATALOG.COURSE_STATUS })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.courseStatusList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
        this.dropdownService
            .getLookup({ displayCode: true, id: LOOKUP_CATALOG.TEACHING_CONCEPT })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.courseFormatList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
        this.dropdownService.getCourseTypeDropdown({ displayCode: true }).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.courseTypeList = entries;
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(message),
                    life: 2000
                });
            }
        });

        this.activeFlagList = [
            { value: true, nameTh: this.translate.instant('common.status.active') },
            { value: false, nameTh: this.translate.instant('common.status.inActive') },
            { value: null, nameTh: this.translate.instant('common.status.all') }
        ];
    }

    openPage(event: MODE_PAGE, forceStatus?: boolean) {
        if (event === 'CREATE') {
            this.forceStatus = forceStatus;
            this.mode = event;
        } else if (event === 'LIST') {
            localStorage.removeItem('course');
            this.mode = event;
            this.initForm = false;
        }
    }

    onBack(event?: any)  {
        this.backToList.emit('LIST');
    }
}
