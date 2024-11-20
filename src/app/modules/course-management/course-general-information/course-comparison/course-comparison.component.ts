import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { MODE_PAGE } from 'src/app/models/common';
import { CourseMainData, CourseMatchingData, SwuCurriculumData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-course-comparison',
    templateUrl: './course-comparison.component.html',
    styleUrls: ['./course-comparison.component.scss']
})
export class CourseComparisonComponent implements OnInit, DoCheck {
    initForm: boolean = false;
    visible: boolean = false;

    @Input() courseMain!: CourseMainData;

    @Input() lang: string;

    items: CourseMatchingData[] = [];
    totalRecords: number = 0;

    detailSubject: SwuCurriculumData[] = [];

    mode: MODE_PAGE = 'LIST';
    editData: CourseMatchingData[] = [];

    /** course attach */
    constructor(
        private translate: TranslateService,
        private messageService: MessageService,
        private courseManagementService: CourseManagementService,
        private loaderService: NgxUiLoaderService,
        private confirmationService: ConfirmationService
    ) {}

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchData();
        }
    }

    ngOnInit(): void {}

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CourseMatchingData = {
            courseId: this.courseMain.courseId,
            first: 0,
            size: 5,
            mode: 'search'
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService.findCourseMatching(criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
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

    openPage(page: MODE_PAGE, id?: number) {
        if (page == 'CREATE') {
            this.loaderService.start();
            this.courseManagementService
                .findCourseMatching({
                    size: 100,
                    first: 0,
                    courseId: id
                })
                .subscribe((result) => {
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
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        }
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

    deleteCourseMatching(id: number) {
        this.confirmationService.confirm({
            key: 'confirm1',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                this.courseManagementService.deleteCourseMatching(id).subscribe(({ status, message }) => {
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
