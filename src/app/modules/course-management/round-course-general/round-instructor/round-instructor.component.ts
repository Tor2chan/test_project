import { TablePageEvent } from 'primeng/table';
import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MODE_PAGE } from 'src/app/models/common';
import { CoursepublicInstructorData, CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-round-instructor',
    templateUrl: './round-instructor.component.html',
    styleUrls: ['./round-instructor.component.scss']
})
export class RoundInstructorComponent implements OnInit, DoCheck {
    initForm: boolean = false;

    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() lang: string;

    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();

    items: CoursepublicInstructorData[] = [];
    totalRecords: number = 0;

    mode: MODE_PAGE = 'LIST';

    editData: CoursepublicInstructorData;

    /**course instructor , mas personal */

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private confirmationService: ConfirmationService
    ) {}
    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchData();
        }
    }
    ngOnInit(): void {}

    userImg: string = 'assets/layout/images/dummy/dummy.svg';

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CoursepublicInstructorData = {
            coursepublicId: this.coursepublicMain.coursepublicId,
            externalEmail: null,
            externalNameEn: null,
            externalNameTh: null,
            filename: null,
            prefix: null,
            module: null,
            instructorId: null,
            instructorMain: false,
            instructorType: false,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicInstructor(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.items = (entries || []).map((o) => {
                        if (o.base64) {
                            const extension = o.filename.split('.')[1];
                            const image = `data:image/${extension};base64,${o.base64}`;
                            return {
                                ...o,
                                base64: image
                            };
                        } else {
                            return o;
                        }
                    });
                    this.totalRecords = totalRecords;
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

    openPage(page: MODE_PAGE, id?: number) {
        this.editData = {
            activeFlag: true,
            coursepublicId: this.coursepublicMain.coursepublicId,
            externalEmail: null,
            externalNameEn: null,
            externalNameTh: null,
            filename: null,
            prefix: null,
            module: null,
            instructorId: null,
            instructorMain: null,
            instructorType: false
        };
        if (page == 'CREATE') {
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.courseManagementService.getCoursepublicInstructor(id).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.editData = result.entries;
                    this.mode = page;
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
    }

    deleteCoursepublicInstructor(id: number) {
        this.confirmationService.confirm({
            key: 'confirm1',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                this.courseManagementService.deleteCoursepublicInstructor(id).subscribe(({ status, message }) => {
                    this.loaderService.stop();
                    this.initForm = false;
                    if (status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: this.translate.instant('common.alert.deleteSuccess'),
                            life: 2000
                        });
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
    }
}
