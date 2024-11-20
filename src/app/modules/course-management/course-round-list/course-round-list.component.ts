import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TablePageEvent } from 'primeng/table';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { CoursepublicLogData, CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { CallBackData } from '../../component/card-list-common/card-list-common.component';
import { environment } from 'src/environments/environment';
import { AutUserData } from 'src/app/models/user-management';

@Component({
    selector: 'app-course-round-list',
    templateUrl: './course-round-list.component.html',
    styleUrls: ['./course-round-list.component.scss']
})
export class CourseRoundListComponent implements DoCheck, OnInit {
    mode: MODE_PAGE = 'LIST';

    visible: boolean = false;

    initForm: boolean = false;
    lang: string = 'th';

    activeFlagList: DropdownData[] = [];
    courseOpeningList: DropdownData[] = [];
    coursepublicLogList: CoursepublicLogData[] = [];
    courseStatusList: DropdownData[] = [];

    criteria: CoursepublicMainData = {
        mode: 'search',
        depIdLevel1: null,
        publicNameTh: null,
        activeFlag: null,
        email: null,
        depNameTh: null,
        depNameEn: null,
        fullNameTh: null,
        fullNameEn: null,
        first: 0,
        size: 5
    };

    baseUrl: string = environment.apiUrl;

    items: CoursepublicMainData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    departmentLevel1List: DropdownData[] = [];
    departmentLevel2List: DropdownData[] = [];

    accessLevel: number | null;

    breadcrumItems: MenuItem[];

    processing: boolean = false;
    showError: boolean = false;
    copyDialog: boolean = false;
    copyData: CoursepublicMainData = {};

    constructor(
        private translate: TranslateService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
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
            { label: this.translate.instant('menu.course.name'), command: () => this.openPage('LIST') },
            {
                label: this.translate.instant('menu.course.courseManagement.courseRound'),
                routerLink: '/course-management/course-round-list'
            }
        ];
    }

    ngOnInit(): void {
        this.activeFlagList = [
            { value: true, nameTh: this.translate.instant('common.status.active') },
            { value: false, nameTh: this.translate.instant('common.status.inActive') },
            { value: null, nameTh: this.translate.instant('common.status.all') }
        ];
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
                { label: this.translate.instant('menu.course.name'), command: () => this.openPage('LIST') },
                {
                    label: this.translate.instant('menu.course.courseManagement.courseRound'),
                    routerLink: '/course-management/course-round-list'
                }
            ];
        }
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onClear();
        }
    }

    loadDropdown() {
        this.dropdownService
            .getLookup({ displayCode: true, id: LOOKUP_CATALOG.COURSE_OPENING_STATUS })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.courseOpeningList = entries;
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

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    onSearch(event?: TablePageEvent) {
        this.loaderService.start();

        this.criteria.mode = 'search';

        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
            if (event.rows !== this.rows) {
                this.backToFirstPage();
            }
        } else {
            this.backToFirstPage();
        }

        this.courseManagementService.findCoursepublicMain(this.criteria).subscribe((result) => {
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
            depIdLevel1: null,
            publicNameTh: null,
            activeFlag: null,
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

    callBack(event: CallBackData) {
        if (event.eventName === 'EDIT') {
            const data: CoursepublicMainData = event.data;
            localStorage.setItem('coursepublic', '' + data.coursepublicId);
            this.mode = 'EDIT';
        } else if (event.eventName === 'REQUEST') {
            const data: CoursepublicMainData = event.data;
            localStorage.setItem('coursepublic', '' + data.coursepublicId);
            this.mode = 'REQUEST';
        } else if (event.eventName === 'APPROVE') {
            const data: CoursepublicMainData = event.data;
            localStorage.setItem('coursepublic', '' + data.coursepublicId);
            this.mode = 'APPROVE';
        } else if (event.eventName === 'VIEW') {
            const data: CoursepublicMainData = event.data;
            const { coursepublicId } = data;
            const origin = window.location.origin;
            const id = {
                coursepublicId: coursepublicId,
                courseId: null
            };
            const enc = window.btoa(JSON.stringify(id));
            setTimeout(() => {
                window.open(`${origin}/course-management/course-preview?data=${enc}`, '_blank');
            }, 50);
        } else if (event.eventName === 'DELETE') {
            const data: CoursepublicMainData = event.data;
            // confirm
            this.confirmationService.confirm({
                key: 'confirm1',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.courseManagementService
                        .deleteCoursepublicMain(data.coursepublicId)
                        .subscribe(({ status, message }) => {
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
                                    detail: this.translate.instant(message),
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
        } else if (event.eventName === 'PRINT') {
            const data: CoursepublicMainData = event.data;
            this.onExportDocx(data);
        } else if (event.eventName === 'CANCEL') {
            const data: CoursepublicMainData = event.data;
            const { coursepublicId } = data;
            const origin = window.location.origin;
            const id = {
                coursepublicId: coursepublicId,
                courseId: null
            };
            const enc = window.btoa(JSON.stringify(id));
            setTimeout(() => {
                window.open(`${origin}/course-management/round-cancellation?data=${enc}`, '_blank');
            }, 50);
        } else if (event.eventName === 'PROCEED') {
            const data: CoursepublicMainData = event.data;
            const { coursepublicId } = data;
            const origin = window.location.origin;
            const id = {
                coursepublicId: coursepublicId,
                courseId: null
            };
            const enc = window.btoa(JSON.stringify(id));
            setTimeout(() => {
                window.open(`${origin}/course-management/round-cancellation-confirmation?data=${enc}`, '_blank');
            }, 50);
        } else if (event.eventName === 'POPUPSTATUS') {
            this.visible = true;
            const data: CoursepublicMainData = event.data;
            this.courseManagementService
                .getCoursepublicLogTimeline(data.coursepublicId)
                .subscribe(({ status, message, entries }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.coursepublicLogList = entries;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(message),
                            life: 2000
                        });
                    }
                });
        } else if (event.eventName === 'COPY') {
            this.copyData = event.data;
            this.copyData.copyNumber = 1;
            this.copyDialog = true;
        }
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    }

    onExport() {}

    openPage(event: MODE_PAGE) {
        if (event === 'CREATE') {
            localStorage.removeItem('coursepublic');
            this.mode = event;
        } else if (event === 'LIST') {
            localStorage.removeItem('coursepublic');
            this.mode = event;
            this.initForm = false;
        }
    }

    onExportDocx(data: CoursepublicMainData) {
        this.loaderService.start();

        let criteria: CoursepublicMainData = {
            mode: 'docx',
            coursepublicId: data.coursepublicId
        };

        this.courseManagementService.findCoursepublicMain(criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                let link = document.createElement('a');
                document.body.appendChild(link);
                link.setAttribute('type', 'hidden');
                link.href = 'data:application/octet-stream;charset=utf-8;base64,' + result.entries;
                link.download = `แบบเสนออนุมัติหลักสูตรอบรมระยะสั้น ${data.publicNameTh}.docx`;
                // link.download = `แบบเสนออนุมัติหลักสูตรอบรมระยะสั้น ${new Date().toJSON().slice(0, 10).replace(/-/g, '')} .docx`;
                link.click();
                document.body.removeChild(link);
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

    onCopyCoursepublicMain() {
        this.confirmationService.confirm({
            key: 'confirmCopy',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.processing = true;
                this.loaderService.start();
                if (this.copyData.copyNumber < 1 || this.copyData.copyNumber > 15) {
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

                this.courseManagementService
                    .postCoursepublicMainCopy(this.copyData)
                    .subscribe(({ status, message }) => {
                        this.processing = false;
                        this.loaderService.stop();
                        if (status == 200) {
                            this.messageService.add({
                                severity: 'success',
                                summary: this.translate.instant('common.alert.success'),
                                detail: message,
                                life: 2000
                            });
                            this.copyDialog = false;
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
                    detail: this.translate.instant('common.alert.reject')
                });
            }
        });
    }
    
}
