import { Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { FinanceReceiptConfigData } from 'src/app/models/financial-management';
import { FinancialManagementService } from 'src/app/services/financial-management.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-setting-receipt',
    templateUrl: './setting-receipt.component.html',
    styleUrls: ['./setting-receipt.component.scss']
})
export class SettingReceiptComponent implements OnInit, DoCheck {
    lang: string = 'th';
    processing: boolean = false;

    showError: boolean = false;
    showErrorOverImg: boolean = false;

    isImageSizeValid: boolean = false;
    showUploadLogo: boolean = true;
    showUploadStaffSignature: boolean = true;


    mode: MODE_PAGE = 'EDIT';

    imgSrcLogo: string = '';
    imgSrcStaffSignature: string = '';
    @ViewChild('fileUpload') fileUpload: any;

    item: FinanceReceiptConfigData = {
        receiptConfigId: null,
        logoPath: null,
        depTaxId: null,
        depNameTh: null,
        depNameEn: null,
        depAddressTh: null,
        depAddressEn: null,
        receiptPrefix: null,
        receiptNoteTh: null,
        receiptNoteEn: null,
        receiptRemark: null,
        staffName: null,
        staffPosition: null,
        staffSignaturePath: null,
        activeFlag: true,
        filename: null,
        prefix: null,
        module: null,
        fullpath: null
    };

    constructor(
        private messageService: MessageService,
        private translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private financialManagementService: FinancialManagementService,
        private uploadFileService: UploadFileService,
        private previewFileSerivce: PreviewFileService
    ) {}

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit(): void {
        this.loadModel();
        this.processing = false;
    }

    loadModel() {
        this.loaderService.start();
        this.financialManagementService.getFinanceReceiptConfig().subscribe(({ status, message, entries }) => {
            this.loaderService.stop();
            if (status === 200) {
                this.item = entries;
                console.log('this.itemmm :>> ', this.item);
                console.log('this.item.logoPath :>> ', this.item.logoPath);
                this.mode = 'EDIT';

                this.loadImageLogo();
                this.loadImageStaffSignature();

                if (this.item) {
                    const { logoPath, logoModule, logoPrefix, staffSignaturePrefix, staffSignatureModule, staffSignaturePath } = this.item;
                    if (logoPath) {
                        this.showUploadLogo = false;
                        this.imgSrcLogo = `${environment.apiUrl}/publicfile/${logoPrefix}/${logoModule}/${logoPath}`;
                    }
                    if (staffSignaturePath) {
                        this.showUploadStaffSignature = false;
                        this.imgSrcStaffSignature =  `${environment.apiUrl}/publicfile/${staffSignaturePrefix}/${staffSignatureModule}/${staffSignaturePath}`;
                    }
                }
            } else {
                this.mode = 'CREATE';
            }
        });
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
        console.log('save');
        this.loaderService.start();

        if (
            !!!this.item.logoPath ||
            !!!this.item.staffSignaturePath ||
            !!!this.item.depTaxId ||
            !!!this.item.depNameTh ||
            !!!this.item.depNameEn ||
            !!!this.item.depAddressTh ||
            !!!this.item.depAddressEn ||
            !!!this.item.staffName ||
            !!!this.item.staffPosition ||
            this.showUploadStaffSignature ||
            this.showUploadLogo
        ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            // this.processing = false;
            this.loaderService.stop();
            return;
        }

        if (this.mode == 'EDIT') {
            this.financialManagementService
                .putFinanceReceiptConfig(this.item.receiptConfigId, this.item)
                .subscribe(({ status, message, entries }) => {
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
        } else {
            this.financialManagementService
                .postFinanceReceiptConfig(this.item)
                .subscribe(({ status, message, entries }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.item = entries;
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: message,
                            life: 2000
                        });
                    }
                });
        }
    }

    onClose(event: ToastCloseEvent) {
        if (    event.message.severity === 'success'
             || event.message.severity === 'warn'
             || event.message.severity === 'error'
           ) {
            this.processing = false;
        }
    }


    onAdvancedUploadLogo(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth > 400 || img.naturalHeight > 400) {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: 'กรุณาใส่ภาพขนาดไม่เกิน 400x400 px',
                    life: 2000
                });
                this.showErrorOverImg = true;
                return

            } else {
                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        console.log('entriesinOnadvanceupLoad :>> ', entries);
                        const { prefix, module, filename } = entries;
                        console.log('entriesi2:>> ', entries);
                        console.log('prefixxx :>> ', prefix);
                        console.log('moduleee :>> ', module);
                        console.log('filenameee :>> ', filename);
                        this.item.logoPath = filename;
                        this.item.logoPrefix = prefix;
                        this.item.logoModule = module;
                        this.imgSrcLogo = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadLogo = false;
                        // this.item.logoPath = entries.fullpath;

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

    onAdvancedUploadStaffSignature(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            if (img.naturalWidth > 400 || img.naturalHeight > 400) {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: 'กรุณาใส่ภาพขนาดไม่เกิน 400x400 px',
                    life: 2000
                });
                this.showErrorOverImg = true;
                return

            } else {
                this.uploadFileService.postCourse(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        console.log('entriesinOnadvanceupLoad :>> ', entries);
                        const { prefix, module, filename } = entries;
                        console.log('prefixxx :>> ', prefix);
                        console.log('moduleee :>> ', module);
                        console.log('filenameee :>> ', filename);
                        this.item.staffSignaturePath = filename;
                        this.item.staffSignaturePrefix = prefix;
                        this.item.staffSignatureModule = module;
                        this.imgSrcStaffSignature = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadStaffSignature = false;
                        // this.item.logoPath = entries.fullpath;

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

    onRemoveUploadLogo(event: FileRemoveEvent, form: any) {
        this.item.logoPath = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }

    onRemoveUploadStaffSignature(event: FileRemoveEvent, form: any) {
        this.item.staffSignaturePath = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }

    onEditImageLogo() {
        this.showUploadLogo = true;
    }

    onEditImageStaffSignature() {
        this.showUploadStaffSignature = true;
    }

    loadImageLogo() {
        if (this.item && this.item.logoPath) {
            this.previewFileSerivce
                .postFile({
                    filename: this.item.logoPath,
                    prefix: this.item.logoPrefix,
                    module: this.item.logoModule
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrcLogo = `data:image/;base64,${entries.base64}`
                        this.showUploadLogo = false;
                        this.item.logoPath = this.item.logoPath
                        this.item.logoPrefix = this.item.logoPrefix
                        this.item.logoModule = this.item.logoModule
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

    loadImageStaffSignature() {
        if (this.item && this.item.staffSignaturePath) {
            this.previewFileSerivce
                .postFile({
                    filename: this.item.staffSignaturePath,
                    prefix: this.item.staffSignaturePrefix,
                    module: this.item.staffSignatureModule
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrcStaffSignature = `data:image/;base64,${entries.base64}`
                        this.showUploadStaffSignature = false;
                        this.item.staffSignaturePath = this.item.staffSignaturePath
                        this.item.staffSignaturePrefix = this.item.staffSignaturePrefix
                        this.item.staffSignatureModule = this.item.staffSignatureModule
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




























    // onAdvancedUploadLogo(event: FileUploadHandlerEvent) {
    //     const file = event.files[0];
    //     this.uploadFileService.postCourse(file)
    //     .subscribe(({ status, message, entries }) => {
    //         if (status === 200) {
    //             this.item.logoPath = entries.fullpath;
    //         }
    //     })
    // }

    userImg: string = 'assets/layout/images/dummy/dummy.svg';

    // onAdvancedUploadSign(event: FileUploadHandlerEvent) {
    //     const file = event.files[0];
    //     this.uploadFileService.postCourse(file)
    //     .subscribe(({ status, message, entries }) => {
    //         if (status === 200) {
    //             this.item.staffSignaturePath = entries.fullpath

    //             this.userImg = `data:image/${entries.extension};base64,${entries.base64}`
    //         }
    //     })
    // }
    // onRemoveUploadLogo(event: FileRemoveEvent, form: any) {
    //     this.item.logoPath = null;
    //     form.clear();
    //     form.uploadedFileCount = 0;
    // }
    // onRemoveUploadSign(event: FileRemoveEvent, form: any) {
    //     this.item.staffSignaturePath = null;
    //     form.clear();
    //     form.uploadedFileCount = 0;
    // }

    // onEditImage() {
    //     this.showUpload = true;
    // }

    // loadImage() {
    //     if (this.item && this.item.logoPath) {
    //         this.previewFileSerivce
    //             .postFile({
    //                 filename: this.item.logoPath,
    //                 // prefix: this.item.prefix,
    //                 // module: this.item.module
    //             })
    //             .subscribe(({ status, message, entries }) => {
    //                 if (status === 200) {
    //                     this.userImg = `data:image/;base64,${entries.base64}`

    //                 } else {
    //                     this.messageService.add({
    //                         severity: 'error',
    //                         summary: this.translate.instant('common.alert.fail'),
    //                         detail: this.translate.instant(message),
    //                         life: 2000
    //                     });
    //                 }
    //             });
    //     }
    //   }
}
