import { Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMediaData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-round-other-illustrations-manage',
    templateUrl: './round-other-illustrations-manage.component.html',
    styleUrls: ['./round-other-illustrations-manage.component.scss']
})
export class RoundOtherIllustrationsManageComponent implements OnInit{

    showError: boolean = false;
    showErrorOverImg: boolean = false;
    processing: boolean = false;
    isImageSizeValid: boolean = false;
    showUpload: boolean = true;

    @Input() item!: CoursepublicMediaData;

    @Input() mode: MODE_PAGE;

    @Input() lang: string;

    @Output() backToListPage = new EventEmitter();

    imgSrc: string = '';
    @ViewChild('fileUpload') fileUpload: any;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private uploadFileService: UploadFileService,
        private previewFileSerivce: PreviewFileService
    ) {}

    ngOnInit(): void {
       this.loadImage();
    }

    onCheckImageSize(event: any) {
        const img = event.target;
        if (img.naturalWidth > 400 || img.naturalHeight > 400) {
            this.isImageSizeValid = false;
        }else{
            this.isImageSizeValid = true;
        }
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (
            !!!this.item.mediaNameEn ||
            !!!this.item.mediaNameTh || !!!this.item.filename || this.showUpload
        ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            this.processing = false;
            this.loaderService.stop();
            return;
        }

        if (this.item.filename) {
            const img = new Image();
                if (img.naturalWidth > 400 || img.naturalHeight > 400) {
                    this.showErrorOverImg = true;
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant('common.alert.overImg'),
                        life: 2000
                    });
                    this.processing = false;
                    this.loaderService.stop();
                    return;

                }else {
                    this.processing = true;
                }
        }

        if (this.mode === 'CREATE') {
            this.courseManagementService.postCoursepublicMedia(this.item).subscribe((result) => {
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
            this.courseManagementService
                .putCoursepublicMedia(this.item.coursepublicMediaId, this.item)
                .subscribe((result) => {
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

        if (!this.isImageSizeValid) {
            this.processing = false;
            this.loaderService.stop();
            return;

        }
    }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');


        }
        if ( event.message.severity === 'success'
             || event.message.severity === 'warn'
             || event.message.severity === 'error'
           ) {
            this.processing = false;
        }
        this.processing = false;

    }

    onAdvancedUpload(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth > 400 || img.naturalHeight > 400) {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant('common.alert.overImg'),
                    life: 2000
                });
                this.showErrorOverImg = true;
                return

            } else {
                this.uploadFileService.postCoursepublic(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.item.filename = filename;
                        this.item.prefix = prefix;
                        this.item.module = module;
                        this.imgSrc = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUpload = false;

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
        };
        img.src = URL.createObjectURL(file);
    }

    onRemoveUpload(event: FileRemoveEvent, form: any) {
        this.item.filename = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }

    onEditImage() {
        this.showUpload = true;
    }

    loadImage() {
        if (this.item && this.item.filename) {
            this.previewFileSerivce
                .postFile({
                    filename: this.item.filename,
                    prefix: this.item.prefix,
                    module: this.item.module
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrc = `data:image/;base64,${entries.base64}`
                        this.showUpload = false;
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
}
