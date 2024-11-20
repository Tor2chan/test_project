import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { CourseMainData, CourseRequestAttachData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';

@Component({
    selector: 'app-view-documents-attach',
    templateUrl: './view-documents-attach.component.html',
    styleUrls: ['./view-documents-attach.component.scss']
})
export class ViewDocumentsAttachComponent implements OnInit {
    @Input() lang: string;
    @Input() courseMain: CourseMainData;

    initForm: boolean = false;

    items: CourseRequestAttachData[] = [];
    totalRecords: number = 0;

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
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

        const criteria: CourseRequestAttachData = {
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
                        detail: message,
                        life: 2000
                    });
                }
            });
    }

    previewPdf(event: CourseRequestAttachData): void {
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
