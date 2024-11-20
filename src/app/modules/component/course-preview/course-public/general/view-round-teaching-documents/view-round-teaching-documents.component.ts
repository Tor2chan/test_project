import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { CoursepublicAttachData, CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';

@Component({
    selector: 'app-view-round-teaching-documents',
    templateUrl: './view-round-teaching-documents.component.html',
    styleUrls: ['./view-round-teaching-documents.component.scss']
})
export class ViewRoundTeachingDocumentsComponent implements OnInit {
    @Input() lang: string;
    @Input() coursepublicMain!: CoursepublicMainData;

    initForm: boolean = false;

    items: CoursepublicAttachData[] = [];
    totalRecords: number = 0;

    constructor(
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService,
        private previewFileSerivce: PreviewFileService,
        private globalService: GlobalService
    ) {}

    ngOnInit(): void {
        this.fetchData();
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();
        const criteria: CoursepublicAttachData = {
            coursepublicId: this.coursepublicMain.coursepublicId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicAttach(criteria)
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
    previewPdf(event: CoursepublicAttachData): void {
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
