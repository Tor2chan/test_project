import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { CourseAttachData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { UploadFileService } from 'src/app/services/upload-file.service';

@Component({
  selector: 'app-documents-and-more-manage',
  templateUrl: './documents-and-more-manage.component.html',
  styleUrls: ['./documents-and-more-manage.component.scss']
})
export class DocumentsAndMoreManageComponent implements OnInit{
    showUpload: boolean = true;
    showError: boolean = false;
    showErrorFile: boolean = false;
    fileSizeExceeded: boolean = false;

    @Input() item!: CourseAttachData;

    @Input() mode: MODE_PAGE;

    @Input() lang: string;

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;
    imgSrc: string;
    fileSize: any;

    @ViewChild('fileUpload') fileUpload: any;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private uploadFileService: UploadFileService,
        private previewFileSerivce: PreviewFileService,
        private globalService: GlobalService
    ) {


    }
    ngOnInit(): void {
        if (this.item.filename) {

            this.showUpload = false;
            }
    }




    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (!!!this.item.fileNameTh || !!!this.item.fileNameEn || !!!this.item.filename) {
            this.showError = true;
               this.messageService.add({
                    severity: 'warn',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant('common.pleaseEnter') ,
                    life: 2000});
            this.loaderService.stop();
            return;
        }


        if (this.fileSize != undefined) {

        if(this.fileSize > 20000000) {
            this.fileSizeExceeded = true;
          //  this.showErrorFile = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.alert.fileUploadSize'),
                life: 2000
            });
            this.loaderService.stop();
            return;
        }
        }



        if (this.mode === 'CREATE') {
            this.courseManagementService.postCourseAttach(this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                } else if (result.status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(result.message),
                        life: 2000
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(result.message),
                        life: 2000
                    });
                }
            });
        } else if (this.mode === 'EDIT') {
            this.courseManagementService.putCourseAttach(this.item.courseAttachId, this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                } else if (result.status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(result.message),
                        life: 2000
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: result.message,
                        life: 2000
                    });
                }
            });
        } else {
            console.log('else');
        }
    }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    onAdvancedUpload(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const fileSize = event.files[0].size;
        this.fileSize = fileSize;

        if (fileSize > 20000000) {
            this.fileSizeExceeded = true;
            this.showErrorFile = true; // แสดงข้อความเตือน

            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.alert.fileUploadSize'),
                life: 2000
            });
        } else {
            this.fileSizeExceeded = false;
            this.showErrorFile = false;
        }

        this.uploadFileService.postCourse(file)
        .subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.item.filename = entries.filename;
                this.item.prefix = entries.prefix;
                this.item.module = entries.module;
                this.showUpload = false;

            }
        })
    }

    onRemoveUpload(event: FileRemoveEvent, form: any) {
        this.item.filename = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showError = true;
        this.showErrorFile = false;
    }

    previewPdf(event: CourseAttachData): void {
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
