import { Component, DoCheck, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, MenuItem } from 'primeng/api';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMediaData } from 'src/app/models/course-management';
import { MasCourseTypeData } from 'src/app/models/master';
import { MasterService } from 'src/app/services/master.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-course-type-manage',
    templateUrl: './course-type-manage.component.html',
    styleUrls: ['./course-type-manage.component.scss']
})
export class CourseTypeManageComponent implements DoCheck, OnInit {
    lang: string;
    showError: boolean = false;
    showErrorOverImg: boolean = false;
    isImageSizeValid: boolean = false;

    @Input() item!: MasCourseTypeData;
    @Input() mode: MODE_PAGE;

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;

    information: MenuItem;
    coursetype: MenuItem;

    showUpload: boolean = true;

    imgSrc: string;
    @ViewChild('fileUpload') fileUpload: any;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private uploadFileService: UploadFileService,
        private loaderService: NgxUiLoaderService,
        private previewFileSerivce: PreviewFileService
    ) {
        this.setItems();
    }
    ngOnInit(): void {
        window.scrollTo(0, 0);
        this.loadImage();
    }

    setItems() {
        this.information = {
            label: this.translate.instant('common.module.master'),
            command: () => this.openPage('LIST')
        };

        this.coursetype = {
            label: this.translate.instant('master.courseType.name'),
            command: () => this.openPage('LIST')
        };
    }

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.setItems();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.setItems();
        }
    }

    openPage(page: MODE_PAGE) {
        this.backToListPage.emit('LIST');
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (!!!this.item.courseMappingStatus) {
            this.item.courseMappingStatus = false;
        }
        if (
            !!!this.item.courseTypeNameTh ||
            !!!this.item.courseTypeNameEn ||
            !!!this.item.filename ||
            this.showUpload
        ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            this.loaderService.stop();
            return;
        }

        // if (this.item.filename) {
        //     const img = new Image();
        //     if (img.naturalWidth > 338 || img.naturalHeight > 226) {
        //         this.showErrorOverImg = true;
        //         this.messageService.add({
        //             severity: 'error',
        //             summary: this.translate.instant('common.alert.fail'),
        //             detail: this.translate.instant('common.alert.overImg'),
        //             life: 2000
        //         });
        //         this.processing = false;
        //         this.loaderService.stop();
        //         return;
        //     } else {
        //         this.processing = true;
        //     }
        // }

        if (this.mode === 'CREATE') {
            this.masterService.postCourseType(this.item).subscribe((result) => {
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
            this.masterService.putCourseType(this.item.courseTypeId, this.item).subscribe((result) => {
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
        this.loaderService.start();
        const file = event.files[0];
        const img = new Image();
        // img.onload = () => {
        //     if (img.naturalWidth > 338 || img.naturalHeight > 226) {
        //         this.messageService.add({
        //             severity: 'error',
        //             summary: this.translate.instant('common.alert.fail'),
        //             detail: this.translate.instant('common.alert.overImg'),
        //             life: 2000
        //         });
        //         this.showErrorOverImg = true;
        //         return;
        //     } else {
        //         this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
        //             if (status === 200) {
        //                 this.item.filename = entries.filename;
        //                 this.item.prefix = entries.prefix;
        //                 this.item.module = entries.module;
        //                 const extension = entries.filename.split('.')[1];
        //                 this.imgSrc = `data:image/${extension};base64,${entries.base64}`;
        //                 this.showUpload = false;
        //             }
        //             console.log(this.imgSrc);
        //         });
        //     }
        // };
        this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.item.filename = entries.filename;
                this.item.prefix = entries.prefix;
                this.item.module = entries.module;
                const extension = entries.filename.split('.')[1];
                this.imgSrc = `data:image/${extension};base64,${entries.base64}`;
                this.showUpload = false;
            }
            console.log(this.imgSrc);
        });
        img.src = URL.createObjectURL(file);
        this.loaderService.stop();
    }

    onCheckImageSize(event: any) {
        var img = event.target;
        if (img.naturalWidth > 338 || img.naturalHeight > 226) {
            this.isImageSizeValid = false;
        } else {
            this.isImageSizeValid = true;
        }
    }

    onRemoveUpload(event: FileRemoveEvent, form: any) {
        this.item.filename = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }

    onEditImage(event: FileUploadHandlerEvent) {
        this.loaderService.start();
        if (this.item.filename) {
            setTimeout(() => {
                this.loaderService.stop();
                this.item.filename = null;
                this.showUpload = true;
            }, 500);
        }
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
                        this.imgSrc = `data:image/;base64,${entries.base64}`;
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
