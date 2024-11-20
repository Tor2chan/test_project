import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastCloseEvent } from 'primeng/toast';
import { PreviewFileService } from 'src/app/services/preview-file.service';

@Component({
    selector: 'app-round-certificate',
    templateUrl: './round-certificate.component.html',
    styleUrls: ['./round-certificate.component.scss']
})
export class RoundCertificateComponent  implements OnInit{
    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() lang: string;

    @Output() backToList = new EventEmitter();

    initForm: boolean = false;
    processing: boolean = false;
    showError: boolean = false;

    showErrorOverImg: boolean = false;
    isImageSizeValid: boolean = false;

    showUploadCertificateTh: boolean = true;
    showUploadCertificateEn: boolean = true;
    showUploadCertificateSignTh1: boolean = true;
    showUploadCertificateSignEn1: boolean = true;
    showUploadCertificateSignTh2: boolean = true;
    showUploadCertificateSignEn2: boolean = true;
    showUploadCertificateSignTh3: boolean = true;
    showUploadCertificateSignEn3: boolean = true;

    imgSrcCertificateTh: string = '';
    imgSrcCertificateEn: string = '';
    imgSrcCertificateSignTh1: string = '';
    imgSrcCertificateSignEn1: string = '';
    imgSrcCertificateSignTh2: string = '';
    imgSrcCertificateSignEn2: string = '';
    imgSrcCertificateSignTh3: string = '';
    imgSrcCertificateSignEn3: string = '';

    @ViewChild('fileUpload') fileUpload: any;

    /** dialog */
    visible: boolean = false;
    base64String: SafeUrl;

    imgSrc: string;

    constructor(
        private messageService: MessageService,
        public translate: TranslateService,
        private uploadFileService: UploadFileService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private previewFileSerivce: PreviewFileService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.initForm = true;
            if (!this.coursepublicMain.certificateSignAmount) {
                this.coursepublicMain.certificateSignAmount = 1;
            }
        }, 100);
        this.loadImageCertificateFilenameTh();
        this.loadImageCertificateFilenameEn();
        this.loadImageCertificateSignTh1();
        this.loadImageCertificateSignEn1();
        this.loadImageCertificateSignTh2();
        this.loadImageCertificateSignEn2();
        this.loadImageCertificateSignTh3();
        this.loadImageCertificateSignEn3();
    }

    categories: any[] = [
        { nameTh: '1 ลายเซ็น', nameEn: '1 Signature', value: '1' },
        { nameTh: '2 ลายเซ็น', nameEn: '2 Signature', value: '2' },
        { nameTh: '3 ลายเซ็น', nameEn: '3 Signature', value: '3' }
    ];

    onSave() {
        this.processing = true;
        this.loaderService.start();

        // validate this here
        if (this.coursepublicMain.certificateSignAmount == 1) {
            if (!!!this.coursepublicMain.certificateSignNameTh1
                || !!!this.coursepublicMain.certificateSignNameEn1
                || !!!this.coursepublicMain.certificateSignPositionTh1
                || !!!this.coursepublicMain.certificateSignPositionEn1
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
        } else if (this.coursepublicMain.certificateSignAmount == 2) {
            if (!!!this.coursepublicMain.certificateSignNameTh1
                || !!!this.coursepublicMain.certificateSignNameEn1
                || !!!this.coursepublicMain.certificateSignPositionTh1
                || !!!this.coursepublicMain.certificateSignPositionEn1
                || !!!this.coursepublicMain.certificateSignNameTh2
                || !!!this.coursepublicMain.certificateSignNameEn2
                || !!!this.coursepublicMain.certificateSignPositionTh2
                || !!!this.coursepublicMain.certificateSignPositionEn2
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
        } else if (this.coursepublicMain.certificateSignAmount == 3) {
            if (!!!this.coursepublicMain.certificateSignNameTh1
                || !!!this.coursepublicMain.certificateSignNameEn1
                || !!!this.coursepublicMain.certificateSignPositionTh1
                || !!!this.coursepublicMain.certificateSignPositionEn1
                || !!!this.coursepublicMain.certificateSignNameTh2
                || !!!this.coursepublicMain.certificateSignNameEn2
                || !!!this.coursepublicMain.certificateSignPositionTh2
                || !!!this.coursepublicMain.certificateSignPositionEn2
                || !!!this.coursepublicMain.certificateSignNameTh3
                || !!!this.coursepublicMain.certificateSignNameEn3
                || !!!this.coursepublicMain.certificateSignPositionTh3
                || !!!this.coursepublicMain.certificateSignPositionEn3
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
        }

        if (this.coursepublicMain.coursepublicId) {
            this.courseManagementService
                .putCoursepublicMainCertificate(this.coursepublicMain.coursepublicId, this.coursepublicMain)
                .subscribe(({ status, message }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: message,
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
        }
    }

    onBack() {
        this.backToList.emit();
    }

    onClose(event: ToastCloseEvent) {
        if (    event.message.severity === 'success'
             || event.message.severity === 'warn'
             || event.message.severity === 'error'
           ) {
            this.processing = false;
        }
    }

    onCheckImageSize(event: any) {
        // const img = event.target;
        // if (img.naturalWidth > 842 || img.naturalHeight > 80) {
        //     this.isImageSizeValid = false;
        // } else {
        //     this.isImageSizeValid = true;
        // }
    }

    onCheckImageSignSize(event: any) {
        // const img = event.target;
        // if (img.naturalWidth > 113 || img.naturalHeight > 40) {
        //     this.isImageSizeValid = false;
        // } else {
        //     this.isImageSizeValid = true;
        // }
    }

    onEditImageCertificateTh() {
        this.showUploadCertificateTh = true;
    }
    onEditImageCertificateEn() {
        this.showUploadCertificateEn = true;
    }
    onEditImageCertificateSignTh1() {
        this.showUploadCertificateSignTh1 = true;
    }
    onEditImageCertificateSignEn1() {
        this.showUploadCertificateSignEn1 = true;
    }
    onEditImageCertificateSignTh2() {
        this.showUploadCertificateSignTh2 = true;
    }
    onEditImageCertificateSignEn2() {
        this.showUploadCertificateSignEn2 = true;
    }
    onEditImageCertificateSignTh3() {
        this.showUploadCertificateSignTh3 = true;
    }
    onEditImageCertificateSignEn3() {
        this.showUploadCertificateSignEn3 = true;
    }

    onAdvancedUploadCertificateTh(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {

                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {

                        const { prefix, module, filename } = entries;

                        this.coursepublicMain.certificateFilenameTh = filename;
                        this.coursepublicMain.certificatePrefixTh = prefix;
                        this.coursepublicMain.certificateModuleTh = module;
                        this.imgSrcCertificateTh = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadCertificateTh = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });

        };
        img.src = URL.createObjectURL(file);
    }

    onAdvancedUploadCertificateEn(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {

                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.coursepublicMain.certificateFilenameEn = filename;
                        this.coursepublicMain.certificatePrefixEn = prefix;
                        this.coursepublicMain.certificateModuleEn = module;
                        this.imgSrcCertificateEn = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadCertificateEn = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });

        };
        img.src = URL.createObjectURL(file);
    }

    onAdvancedUploadCertificateSignTh1(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {

                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.coursepublicMain.certificateSignFilenameTh1 = filename;
                        this.coursepublicMain.certificateSignPrefixTh1 = prefix;
                        this.coursepublicMain.certificateSignModuleTh1 = module;
                        this.imgSrcCertificateSignTh1 = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadCertificateSignTh1 = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });

        };
        img.src = URL.createObjectURL(file);
    }

    onAdvancedUploadCertificateSignEn1(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {

                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.coursepublicMain.certificateSignFilenameEn1 = filename;
                        this.coursepublicMain.certificateSignPrefixEn1 = prefix;
                        this.coursepublicMain.certificateSignModuleEn1 = module;
                        this.imgSrcCertificateSignEn1 = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadCertificateSignEn1 = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });

        };
        img.src = URL.createObjectURL(file);
    }

    onAdvancedUploadCertificateSignTh2(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            // if (img.naturalWidth > 113 || img.naturalHeight > 40) {
            //     this.messageService.add({
            //         severity: 'error',
            //         summary: this.translate.instant('common.alert.fail'),
            //         detail: 'กรุณาใส่ภาพขนาดไม่เกิน 113x40 px',
            //         life: 2000
            //     });
            //     this.showErrorOverImg = true;
            //     return;
            // } else {
                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.coursepublicMain.certificateSignFilenameTh2 = filename;
                        this.coursepublicMain.certificateSignPrefixTh2 = prefix;
                        this.coursepublicMain.certificateSignModuleTh2 = module;
                        this.imgSrcCertificateSignTh2 = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadCertificateSignTh2 = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });
            // }
        };
        img.src = URL.createObjectURL(file);
    }

    onAdvancedUploadCertificateSignEn2(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            // if (img.naturalWidth > 113 || img.naturalHeight > 40) {
            //     this.messageService.add({
            //         severity: 'error',
            //         summary: this.translate.instant('common.alert.fail'),
            //         detail: 'กรุณาใส่ภาพขนาดไม่เกิน 113x40 px',
            //         life: 2000
            //     });
            //     this.showErrorOverImg = true;
            //     return;
            // } else {
                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.coursepublicMain.certificateSignFilenameEn2 = filename;
                        this.coursepublicMain.certificateSignPrefixEn2 = prefix;
                        this.coursepublicMain.certificateSignModuleEn2 = module;
                        this.imgSrcCertificateSignEn2 = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadCertificateSignEn2 = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });
            // }
        };
        img.src = URL.createObjectURL(file);
    }

    onAdvancedUploadCertificateSignTh3(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            // if (img.naturalWidth > 113 || img.naturalHeight > 40) {
            //     this.messageService.add({
            //         severity: 'error',
            //         summary: this.translate.instant('common.alert.fail'),
            //         detail: 'กรุณาใส่ภาพขนาดไม่เกิน 113x40 px',
            //         life: 2000
            //     });
            //     this.showErrorOverImg = true;
            //     return;
            // } else {
                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.coursepublicMain.certificateSignFilenameTh3 = filename;
                        this.coursepublicMain.certificateSignPrefixTh3 = prefix;
                        this.coursepublicMain.certificateSignModuleTh3 = module;
                        this.imgSrcCertificateSignTh3 = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadCertificateSignTh3 = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });
            // }
        };
        img.src = URL.createObjectURL(file);
    }

    onAdvancedUploadCertificateSignEn3(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            // if (img.naturalWidth > 113 || img.naturalHeight > 40) {
            //     this.messageService.add({
            //         severity: 'error',
            //         summary: this.translate.instant('common.alert.fail'),
            //         detail: 'กรุณาใส่ภาพขนาดไม่เกิน 113x40 px',
            //         life: 2000
            //     });
            //     this.showErrorOverImg = true;
            //     return;
            // } else {
                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.coursepublicMain.certificateSignFilenameEn3 = filename;
                        this.coursepublicMain.certificateSignPrefixEn3 = prefix;
                        this.coursepublicMain.certificateSignModuleEn3 = module;
                        this.imgSrcCertificateSignEn3 = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadCertificateSignEn3 = false;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });
            // }
        };
        img.src = URL.createObjectURL(file);
    }

    onRemoveUploadCertificateTh(event: FileRemoveEvent, form: any) {
        this.coursepublicMain.certificateFilenameTh = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }
    onRemoveUploadCertificateEn(event: FileRemoveEvent, form: any) {
        this.coursepublicMain.certificateFilenameEn = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }
    onRemoveUploadCertificateSignTh1(event: FileRemoveEvent, form: any) {
        this.coursepublicMain.certificateSignFilenameTh1 = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }
    onRemoveUploadCertificateSignEn1(event: FileRemoveEvent, form: any) {
        this.coursepublicMain.certificateSignFilenameEn1 = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }
    onRemoveUploadCertificateSignTh2(event: FileRemoveEvent, form: any) {
        this.coursepublicMain.certificateSignFilenameTh2 = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }
    onRemoveUploadCertificateSignEn2(event: FileRemoveEvent, form: any) {
        this.coursepublicMain.certificateSignFilenameEn2 = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }
    onRemoveUploadCertificateSignTh3(event: FileRemoveEvent, form: any) {
        this.coursepublicMain.certificateSignFilenameTh3 = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }
    onRemoveUploadCertificateSignEn3(event: FileRemoveEvent, form: any) {
        this.coursepublicMain.certificateSignFilenameEn3 = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }

    previewPdf() {
        this.loaderService.start();
        this.courseManagementService.getCoursepublicMainCertificate(this.coursepublicMain.coursepublicId).subscribe({
            next: (result) => {
                this.loaderService.stop();
                if (result?.body && result?.headers) {
                    const data = window.URL.createObjectURL(result.body);
                    this.base64String = data;
                    this.visible = true;
                }
            },
            error: (err) => {
                this.loaderService.stop();
                const { status, messages } = err;
                if (messages) {
                    const messageLog = [, , messages];
                }
            }
        });
    }

    loadImageCertificateFilenameTh() {
        if (this.coursepublicMain && this.coursepublicMain.certificateFilenameTh) {
            this.previewFileSerivce
                .postFile({
                    filename: this.coursepublicMain.certificateFilenameTh,
                    prefix: this.coursepublicMain.certificatePrefixTh,
                    module: this.coursepublicMain.certificateModuleTh
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        // this.coursepublicMain.certificateFilenameTh = entries.filename;
                        // this.coursepublicMain.certificatePrefixTh = entries.prefix;
                        // this.coursepublicMain.certificateModuleTh = entries.module;
                        this.imgSrcCertificateTh = `data:image/;base64,${entries.base64}`
                        this.showUploadCertificateTh = false;
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

      loadImageCertificateFilenameEn() {
        if (this.coursepublicMain && this.coursepublicMain.certificateFilenameEn) {
            this.previewFileSerivce
                .postFile({
                    filename: this.coursepublicMain.certificateFilenameEn,
                    prefix: this.coursepublicMain.certificatePrefixEn,
                    module: this.coursepublicMain.certificateModuleEn
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        // this.coursepublicMain.certificateFilenameEn = entries.filename;
                        // this.coursepublicMain.certificatePrefixEn = entries.prefix;
                        // this.coursepublicMain.certificateModuleEn = entries.module;
                        this.imgSrcCertificateEn = `data:image/;base64,${entries.base64}`
                        this.showUploadCertificateEn = false;
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

      loadImageCertificateSignTh1() {
        if (this.coursepublicMain && this.coursepublicMain.certificateSignFilenameTh1) {
            this.previewFileSerivce
                .postFile({
                    filename: this.coursepublicMain.certificateSignFilenameTh1,
                    prefix: this.coursepublicMain.certificateSignPrefixTh1,
                    module: this.coursepublicMain.certificateSignModuleTh1
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrcCertificateSignTh1 = `data:image/;base64,${entries.base64}`
                        this.showUploadCertificateSignTh1 = false;
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
      loadImageCertificateSignEn1() {
        if (this.coursepublicMain && this.coursepublicMain.certificateSignFilenameEn1) {
            this.previewFileSerivce
                .postFile({
                    filename: this.coursepublicMain.certificateSignFilenameEn1,
                    prefix: this.coursepublicMain.certificateSignPrefixEn1,
                    module: this.coursepublicMain.certificateSignModuleEn1
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrcCertificateSignEn1 = `data:image/;base64,${entries.base64}`
                        this.showUploadCertificateSignEn1 = false;
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

      loadImageCertificateSignTh2() {
        if (this.coursepublicMain && this.coursepublicMain.certificateSignFilenameTh2) {
            this.previewFileSerivce
                .postFile({
                    filename: this.coursepublicMain.certificateSignFilenameTh2,
                    prefix: this.coursepublicMain.certificateSignPrefixTh2,
                    module: this.coursepublicMain.certificateSignModuleTh2
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrcCertificateSignTh2 = `data:image/;base64,${entries.base64}`
                        this.showUploadCertificateSignTh2 = false;
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
      loadImageCertificateSignEn2() {
        if (this.coursepublicMain && this.coursepublicMain.certificateSignFilenameEn2) {
            this.previewFileSerivce
                .postFile({
                    filename: this.coursepublicMain.certificateSignFilenameEn2,
                    prefix: this.coursepublicMain.certificateSignPrefixEn2,
                    module: this.coursepublicMain.certificateSignModuleEn2
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrcCertificateSignEn2 = `data:image/;base64,${entries.base64}`
                        this.showUploadCertificateSignEn2 = false;
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

      loadImageCertificateSignTh3() {
        if (this.coursepublicMain && this.coursepublicMain.certificateSignFilenameTh3) {
            this.previewFileSerivce
                .postFile({
                    filename: this.coursepublicMain.certificateSignFilenameTh3,
                    prefix: this.coursepublicMain.certificateSignPrefixTh3,
                    module: this.coursepublicMain.certificateSignModuleTh3
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrcCertificateSignTh3 = `data:image/;base64,${entries.base64}`
                        this.showUploadCertificateSignTh3 = false;
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
      loadImageCertificateSignEn3() {
        if (this.coursepublicMain && this.coursepublicMain.certificateSignFilenameEn3) {
            this.previewFileSerivce
                .postFile({
                    filename: this.coursepublicMain.certificateSignFilenameEn3,
                    prefix: this.coursepublicMain.certificateSignPrefixEn3,
                    module: this.coursepublicMain.certificateSignModuleEn3
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrcCertificateSignEn3 = `data:image/;base64,${entries.base64}`
                        this.showUploadCertificateSignEn3 = false;
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
