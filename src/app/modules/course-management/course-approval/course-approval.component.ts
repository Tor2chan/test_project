import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import {
    CourseActivityData,
    CourseAttachData,
    CourseCompanyData,
    CourseInstructorData,
    CourseMainData,
    CourseMatchingData,
    CourseRequestAttachData,
    CourseScloData,
    CourseSkillData,
    SwuCurriculumData
} from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';

type SAVEMODE = 'REQUEST' | 'APPROVE' | 'SENDBACK';

@Component({
    selector: 'app-course-approval',
    templateUrl: './course-approval.component.html',
    styleUrls: ['./course-approval.component.scss']
})
export class CourseApprovalComponent implements OnInit {
    @Input() lang: string;
    @Input() mode: MODE_PAGE = 'REQUEST';

    courseMain: CourseMainData;
    courseInstructorItems: CourseInstructorData[] = [];
    courseInstructorTotalRecords: number = 0;
    courseCompanyItems: CourseCompanyData[] = [];
    courseCompanyTotalRecords: number = 0;
    courseMatchingItems: CourseMatchingData[] = [];
    courseMatchingTotalRecords: number = 0;
    courseSkillItems: CourseSkillData[] = [];
    courseSkillTotalRecords: number = 0;
    courseScloItems: CourseScloData[] = [];
    courseScloTotalRecords: number = 0;
    courseActivityItems: CourseActivityData[] = [];
    courseActivityTotalRecords: number = 0;
    courseAttachItems: CourseAttachData[] = [];
    courseAttachTotalRecords: number = 0;
    courseRequestAttachItems: CourseRequestAttachData[] = [];
    courseRequestAttachTotalRecords: number = 0;

    sumWeight: number = 0;

    // courseMain: CourseMainData[] = [];

    @Output() goBack = new EventEmitter();

    initForm: boolean = false;
    visible: boolean = false;
    processing: boolean = false;

    detailSubject: SwuCurriculumData[] = [];

    errorMsg: string = '';

    constructor(
        private translate: TranslateService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private previewFileSerivce: PreviewFileService,
        private globalService: GlobalService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo(0, 0);
            this.loadCourseMain();
            this.fetchInstructorData();
            this.fetchCompanyData();
            this.fetchMatchingData();
            this.fetchSkillData();
            this.fetchScloData();
            this.fetchActivityData();
            this.fetchAttachData();
            this.fetchRequestAttachData();
        }, 100);

        setTimeout(() => {
            this.initForm = true;
        }, 200);
    }

    loadCourseMain() {
        const courseId = Number(localStorage.getItem('course'));
        this.courseManagementService.getCourseMain(courseId).subscribe(({ status, message, entries }) => {
            this.initForm = true;
            if (status === 200) {
                this.courseMain = entries;
            }
        });
    }

    fetchInstructorData(event?: TablePageEvent) {
        const courseId = Number(localStorage.getItem('course'));
        const criteria: CourseInstructorData = {
            courseId: courseId,
            externalEmail: null,
            externalNameEn: null,
            externalNameTh: null,
            filename: null,
            prefix: null,
            module: null,
            instructorType: false,
            first: 0,
            size: 5,
            instructorMain: false,
            activeFlag: true
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseInstructor(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                if (status === 200) {
                    this.initForm = true;
                    this.courseInstructorItems = entries;
                    this.courseInstructorTotalRecords = totalRecords;
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

    fetchCompanyData(event?: TablePageEvent) {
        const courseId = Number(localStorage.getItem('course'));
        const criteria: CourseCompanyData = {
            courseId: courseId,
            companyAddress: null,
            companyName: null,
            companyOwnerName: null,
            companyTel: null,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseCompany(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.initForm = true;
                    this.courseCompanyItems = entries;
                    this.courseCompanyTotalRecords = totalRecords;
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

    fetchMatchingData(event?: TablePageEvent) {
        const courseId = Number(localStorage.getItem('course'));
        const criteria: CourseMatchingData = {
            courseId: courseId,

            first: 0,
            size: 5,
            mode: 'search',
            activeFlag: true
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService.findCourseMatching(criteria).subscribe((result) => {
            if (result.status === 200) {
                this.initForm = true;
                this.courseMatchingItems = result.entries;
                this.courseMatchingTotalRecords = result.totalRecords;
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

    fetchSkillData(event?: TablePageEvent) {
        const courseId = Number(localStorage.getItem('course'));
        const criteria: CourseSkillData = {
            courseId: courseId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseSkill(criteria)
            .subscribe(({ status, message, entries, totalRecords, sumWeight }) => {
                if (status === 200) {
                    this.initForm = true;
                    this.courseSkillItems = entries;
                    this.courseSkillTotalRecords = totalRecords;
                    this.sumWeight = sumWeight;
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

    fetchScloData(event?: TablePageEvent) {
        const courseId = Number(localStorage.getItem('course'));
        const criteria: CourseScloData = {
            courseScloCode: null,
            courseScloDesc: null,
            courseId: courseId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseSclo(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.initForm = true;
                    this.courseScloItems = entries;
                    this.courseScloTotalRecords = totalRecords;
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

    fetchActivityData(event?: TablePageEvent) {
        const courseId = Number(localStorage.getItem('course'));
        const criteria: CourseActivityData = {
            courseId: courseId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService.findCourseActivity(criteria).subscribe((result) => {
            if (result.status === 200) {
                this.initForm = true;
                this.courseActivityItems = result.entries;
                this.courseActivityTotalRecords = result.totalRecords;
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

    fetchAttachData(event?: TablePageEvent) {
        const courseId = Number(localStorage.getItem('course'));
        const criteria: CourseAttachData = {
            courseId: courseId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseAttach(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.initForm = true;
                    this.courseAttachItems = entries;
                    this.courseAttachTotalRecords = totalRecords;
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

    fetchRequestAttachData(event?: TablePageEvent) {
        const courseId = Number(localStorage.getItem('course'));
        const criteria: CourseRequestAttachData = {
            courseId: courseId,
            activeFlag: true,
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
                    this.courseRequestAttachItems = entries;
                    this.courseRequestAttachTotalRecords = totalRecords;
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
    onClose(event: ToastCloseEvent) {
        if (
            event.message.severity === 'success' ||
            event.message.severity === 'warn' ||
            event.message.severity === 'error'
        ) {
            this.processing = false;
        }
    }
    onBack() {
        this.goBack.emit('LIST');
    }
    // sumSkillWeight(): number {
    //     return (this.courseSkillItems || []).reduce((acc, curr) => (acc += curr.skillWeight), 0) || 0;
    // }
    onSave(saveMode: SAVEMODE) {
        this.processing = true;
        this.loaderService.start();
        if (saveMode === 'APPROVE') {
            /** อนุมัติโครงการ */
            this.courseMain.courseMainStatus = 30010005;
        } else if (saveMode === 'REQUEST') {
            if (this.courseMain.forceStatus) {
                /** อนุมัติโครงการ */
                this.courseMain.courseMainStatus = 30010005;
            } else {
                /** รอสภาอนุมัติ */
                this.courseMain.courseMainStatus = 30010003;
            }
        } else if (saveMode === 'SENDBACK') {
            /** รอส่ง */
            this.courseMain.courseMainStatus = 30010007;
        }
        this.courseManagementService
            .putCourseMainStatus(this.courseMain.courseId, this.courseMain)
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                    setTimeout(() => {
                        this.onBack();
                    }, 1000);
                } else if (status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
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

    showDetail(subjectKey: string) {
        this.visible = true;

        const criteria: SwuCurriculumData = {
            subjectKey: subjectKey
        };

        this.courseManagementService
            .findSwuCurriculum(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.detailSubject = entries;
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

    previewPdf(event: any): void {
        this.loaderService.start();
        this.previewFileSerivce
            .postFile({
                filename: event.filename,
                prefix: event.prefix,
                module: event.module
            })
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    const base64ToArrayBuffer = (data) => {
                        const bString = window.atob(data);
                        const bLength = bString.length;
                        const bytes = new Uint8Array(bLength);
                        for (let i = 0; i < bLength; i++) {
                            bytes[i] = bString.charCodeAt(i);
                        }
                        return bytes;
                    };
                    // const filename = this.lang === 'th' ? event.fileNameTh : event.fileNameEn
                    const bufferArray = base64ToArrayBuffer(entries.base64);
                    const blobStore = new Blob([bufferArray], { type: 'application/pdf' });
                    const data = window.URL.createObjectURL(blobStore);
                    this.globalService.openTargetBlank(data);
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
}
