import { Component, DoCheck, Input, OnInit } from '@angular/core';
import { MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData, CoursepublicMediaData, CoursepublicAttachData } from 'src/app/models/course-management';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TablePageEvent } from 'primeng/table';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { GlobalService } from 'src/app/services/global-service.service';
@Component({
    selector: 'app-round-other-illustrations',
    templateUrl: './round-other-illustrations.component.html',
    styleUrls: ['./round-other-illustrations.component.scss']
})
export class RoundOtherIllustrationsComponent implements OnInit, DoCheck {
    initForm: boolean = false;
    processing: boolean = false;

    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() coursepublicMedia!: CoursepublicMediaData;

    @Input() lang: string;

    items: CoursepublicMediaData[] = [];
    totalRecords: number = 0;

    mode: MODE_PAGE = 'LIST';
    editData: CoursepublicMediaData;

    /**course instructor , mas personal */

    constructor(
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService,
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
    ngOnInit(): void {
        this.fetchData();
        this.initialForm();
    }
    initialForm() {
        this.coursepublicMedia = {
            activeFlag: true,
            coursepublicId: this.coursepublicMain.coursepublicId,
            /** ภาพประกอบอื่นๆ */
            mediaType: 30012002,
            coursepublicMediaId: null,
            filename: null,
            prefix: null,
            module: null,
            mediaNameEn: null,
            mediaNameTh: null
        };
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CoursepublicMediaData = {
            coursepublicId: this.coursepublicMain.coursepublicId,
            /** ภาพประกอบอื่นๆ */
            mediaType: 30012002,
            activeFlag: true,
            filename: null,
            prefix: null,
            module: null,
            mediaNameEn: null,
            mediaNameTh: null,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicMedia(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
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
            coursepublicId: this.coursepublicMain.coursepublicId,
            filename: null,
            prefix: null,
            module: null,
            mediaNameEn: null,
            mediaNameTh: null,
            /** ภาพประกอบอื่นๆ */
            mediaType: 30012002
        };
        if (page == 'CREATE') {
            console.log('page', page);
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.courseManagementService.getCoursepublicMedia(id).subscribe((result) => {
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

    previewImage(event: CoursepublicMediaData): void {
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

                    const blobType = event.filename.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

                    const bufferArray = base64ToArrayBuffer(entries.base64);
                    const blobStore = new Blob([bufferArray], { type: blobType });
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

    deleteCoursepublicMedia(id: number) {
        this.confirmationService.confirm({
            key: 'confirm1',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                this.courseManagementService.deleteCoursepublicMedia(id).subscribe(({ status, message }) => {
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
