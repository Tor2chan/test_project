import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { CoursepublicMainData, CoursepublicMediaData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-view-round-thumbnail',
    templateUrl: './view-round-thumbnail.component.html',
    styleUrls: ['./view-round-thumbnail.component.scss']
})
export class ViewRoundThumbnailComponent implements OnInit {
    @Input() lang: string;
    @Input() coursepublicMain!: CoursepublicMainData;

    initForm: boolean = false;

    coursepublicMedia: CoursepublicMediaData;

    items: CoursepublicMediaData[] = [];
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
        const criteria: CoursepublicMediaData = {
            coursepublicId: this.coursepublicMain.coursepublicId,
            mediaType: 30012001,
            first: 0,
            size: 5,
            activeFlag: true
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
                    this.initForm = true;
                    this.items = entries.map((o) => {
                        if (o.filename) {
                            const fullpath = `${environment.apiUrl}/publicfile/${o.prefix}/${o.module}/${o.filename}`;
                            return {
                                ...o,
                                fullpath
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

                    const blobType = (event.filename.toLowerCase().endsWith('.png')) ? 'image/png' : 'image/jpeg';

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
}
