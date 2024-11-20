import { CourseManagementService } from './../../../../services/course-management.service';
import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { MODE_PAGE } from 'src/app/models/common';
import { CourseCompanyData, CourseMainData } from 'src/app/models/course-management';

@Component({
    selector: 'app-related-agencies-or-establishments',
    templateUrl: './related-agencies-or-establishments.component.html',
    styleUrls: ['./related-agencies-or-establishments.component.scss']
})
export class RelatedAgenciesOrEstablishmentsComponent implements OnInit, DoCheck {
    initForm: boolean = false;

    @Input() courseMain!: CourseMainData;

    @Input() lang: string;

    items: CourseCompanyData[] = [];
    totalRecords: number = 0;

    mode: MODE_PAGE = 'LIST';
    editData: CourseCompanyData;

    /**course companyS */

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

    ngOnInit(): void {
        this.fetchData();
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CourseCompanyData = {
            companyAddress: null,
            companyName: null,
            companyOwnerName: null,
            companyTel: null,
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
            .findCourseCompany(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.initForm = true;
                    this.items = entries;
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
            courseId: this.courseMain.courseId,
            companyName: '',
            companyAddress: '',
            companyOwnerName: '',
            companyTel: '',
            activeFlag: true
        };
        if (page == 'CREATE') {
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.courseManagementService.getCourseCompany(id).subscribe((result) => {
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

    deleteCourseCompany(id: number) {
        this.confirmationService.confirm({
            key: 'confirm1',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                this.courseManagementService.deleteCourseCompany(id).subscribe(({ status, message }) => {
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
