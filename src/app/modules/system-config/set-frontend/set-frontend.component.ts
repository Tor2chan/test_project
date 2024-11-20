import { PreviewFileService } from './../../../services/preview-file.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { SetFrontEndData } from 'src/app/models/system-config';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SystemConfigService } from 'src/app/services/system-config.service';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownService } from 'src/app/services/dropdown.service';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';
import { SafeUrl } from '@angular/platform-browser';

@Component({
    selector: 'app-set-frontend',
    templateUrl: './set-frontend.component.html',
    styleUrls: ['./set-frontend.component.scss']
})
export class SetFrontendComponent implements OnInit {
    item: SetFrontEndData;
    popularList: DropdownData[] = [];

    lang: string = 'th';
    processing: boolean = false;

    showError: boolean = false;

    showErrorOverImg: boolean = false;
    isImageSizeValid: boolean = false;

    showUploadLogoHeader: boolean = true;
    showUploadLogoFooter: boolean = true;

    imgSrcLogoHeader: string = '';
    imgSrcLogoFooter: string = '';

    @ViewChild('fileUpload') fileUpload: any;



    mode: MODE_PAGE = 'EDIT';

    constructor(
        private messageService: MessageService,
        private translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private systemConfigService: SystemConfigService,
        private dropdownService: DropdownService,
        private uploadFileService: UploadFileService,
        private previewFileService: PreviewFileService
    ) {}

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit(): void {
        this.loadMaster();
        this.loadModel();

    }

    loadMaster() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.POPULAR_COURSE_COUNT_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.popularList = entries;

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

    loadModel() {
        this.loaderService.start();
        this.systemConfigService.getSetFrontend().subscribe(({ status, message, entries }) => {
            this.loaderService.stop();
            if (status === 200) {
                this.item = entries;

                this.loadImageLogoHeader();
                this.loadImageLogoFooter();

            } else {
                console.log('เกิดข้อผิดพลาด');
                // this.messageService.add({
                //     severity: 'error',
                //     summary: this.translate.instant('common.alert.fail'),
                //     detail: message,
                //     life: 2000
                // });
            }
        });
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();

        if (!!!this.item.title
            || !!!this.item.metaDescription
            || !!!this.item.facebookPath
            || !!!this.item.linePath
            || !!!this.item.xPath
            || !!!this.item.igPath
            || !!!this.item.youtubePath
            || !!!this.item.contactAddress
            || !!!this.item.contactEmail
            || !!!this.item.contactTel
            || !!!this.item.universityNameTh
            || !!!this.item.universityNameEn
            || !!!this.item.website
            || !!!this.item.universityTaxNo
            || !!!this.item.moodleToken
            || !!!this.item.kmitlToken
            || !!!this.item.registerTokenExpireMinute
            || !!!this.item.popularCourseDisplayLimit
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
        } else {
        this.systemConfigService
            .putSetFrontend(this.item.setId, this.item)
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

    onClose(event: ToastCloseEvent) {
        console.log('event :>> ', event);
        this.processing = false;
    }

    onCheckImageSignSize(event: any) {
        // const img = event.target;
        // if (img.naturalWidth > 113 || img.naturalHeight > 40) {
        //     this.isImageSizeValid = false;
        // } else {
        //     this.isImageSizeValid = true;
        // }
    }

    onEditImageLogoHeader() {
        this.showUploadLogoHeader = true;
        this.item.logoHeaderModule = null;
        this.item.logoHeaderPath = null;
        this.item.logoHeaderPrefix = null;
    }

    onEditImageLogoFooter() {
        this.showUploadLogoFooter = true;
        this.item.logoFooterModule = null;
        this.item.logoFooterPath = null;
        this.item.logoFooterPrefix = null;
    }



    onAdvancedUploadLogoHeader(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {

                this.uploadFileService.postSystem(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {

                        const { prefix, module, filename } = entries;

                        this.item.logoHeaderPath = filename;
                        this.item.logoHeaderPrefix = prefix;
                        this.item.logoHeaderModule = module;
                        this.imgSrcLogoHeader = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadLogoHeader = false;
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

    onAdvancedUploadLogoFooter(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {

                this.uploadFileService.postSystem(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.item.logoFooterPath = filename;
                        this.item.logoFooterPrefix = prefix;
                        this.item.logoFooterModule = module;
                        this.imgSrcLogoFooter = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUploadLogoFooter = false;
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

    onRemoveUploadLogoHeader(event: FileRemoveEvent, form: any) {
        this.item.logoHeaderPath = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }

    onRemoveUploadLogoFooter(event: FileRemoveEvent, form: any) {
        this.item.logoFooterPath = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }

    loadImageLogoHeader() {

        if (this.item && this.item.logoHeaderPath) {

            this.previewFileService
                .postFile({
                    filename: this.item.logoHeaderPath,
                    prefix: this.item.logoHeaderPrefix,
                    module: this.item.logoHeaderModule
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        // this.item.logoHeaderPath = entries.filename;
                        // this.item.logoHeaderPrefix = entries.prefix;
                        // this.item.logoHeaderModule = entries.module;
                        this.imgSrcLogoHeader = `data:image/;base64,${entries.base64}`
                        this.showUploadLogoHeader = false;
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

      loadImageLogoFooter() {
        if (this.item && this.item.logoFooterPath) {

            this.previewFileService
                .postFile({
                    filename: this.item.logoFooterPath,
                    prefix: this.item.logoFooterPrefix,
                    module: this.item.logoFooterModule
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        // this.item.logoFooterPath = entries.filename;
                        // this.item.logoFooterPrefix = entries.prefix;
                        // this.item.logoFooterModule = entries.module;
                        this.imgSrcLogoFooter = `data:image/;base64,${entries.base64}`
                        this.showUploadLogoFooter = false;
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
