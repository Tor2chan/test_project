import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { MODE_PAGE } from 'src/app/models/common';
import { CourseRequestAttachData, CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';

@Component({
    selector: 'app-course-approval-documents',
    templateUrl: './course-approval-documents.component.html',
    styleUrls: ['./course-approval-documents.component.scss']
})
export class CourseApprovalDocumentsComponent implements OnInit, DoCheck {
    initForm: boolean = false;

    @Input() courseMain!: CourseMainData;

    @Input() lang: string;

    items: CourseRequestAttachData[] = [];
    totalRecords: number = 0;

    mode: MODE_PAGE = 'LIST';
    editData: CourseRequestAttachData;

    /** course attach */
    constructor(
        private translate: TranslateService,
        private messageService: MessageService,
        private courseManagementService: CourseManagementService,
        private loaderService: NgxUiLoaderService,
        private previewFileSerivce: PreviewFileService,
        private confirmationService: ConfirmationService,
        private globalService: GlobalService
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

        const criteria: CourseRequestAttachData = {
            courseId: this.courseMain.courseId,
            filename: null,
            prefix: null,
            module: null,
            fileNameEn: null,
            fileNameTh: null,
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
            activeFlag: true,
            courseRequestAttachId: null,
            courseId: this.courseMain.courseId,
            filename: null,
            prefix: null,
            module: null,
            fileNameEn: null,
            fileNameTh: null
        };
        if (page == 'CREATE') {
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.courseManagementService.getCourseRequestAttach(id).subscribe((result) => {
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

    previewPdf(event: CourseRequestAttachData): void {
        console.log('event :>> ', event);
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

    deleteCourseRequestAttach(id: number) {
        this.confirmationService.confirm({
            key: 'confirm1',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                this.courseManagementService.deleteCourseRequestAttach(id).subscribe(({ status, message }) => {
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
