import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { MODE_PAGE } from 'src/app/models/common';
import { CourseMainData, CourseSkillData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-learning-outcomes',
    templateUrl: './learning-outcomes.component.html',
    styleUrls: ['./learning-outcomes.component.scss']
})
export class LearningOutcomesComponent implements OnInit, DoCheck {
    initForm: boolean = false;

    @Input() courseMain!: CourseMainData;

    @Input() lang: string;

    items: CourseSkillData[] = [];
    totalRecords: number = 0;
    sumWeight: number = 0;

    mode: MODE_PAGE = 'LIST';
    editData: CourseSkillData;

    /**course companyS */ skillWeight;

    constructor(
        private translate: TranslateService,
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

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CourseSkillData = {
            courseId: this.courseMain.courseId,
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
                this.loaderService.stop();
                if (status === 200) {
                    this.items = entries;
                    this.totalRecords = totalRecords;
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

    openPage(page: MODE_PAGE, id?: number) {
        this.editData = {
            courseId: this.courseMain.courseId,
            courseSkillId: null,
            generalSkillId: null,
            activeFlag: true,
            skillLevel: null,
            courseSkillOtherStatus: false,
            courseSkillOtherNameTh: null,
            courseSkillOtherNameEn: null
        };

        if (page == 'CREATE') {
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.courseManagementService.getCourseSkill(id).subscribe((result) => {
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

    sumSkillWeight(): number {
        return (this.items || []).reduce((acc, curr) => (acc += curr.skillWeight), 0) || 0;
    }

    deleteCourseSkill(id: number) {
        console.log('id :>> ', id);

        this.confirmationService.confirm({
            key: 'confirm1',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                this.courseManagementService.deleteCourseSkill(id).subscribe(({ status, message }) => {
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
