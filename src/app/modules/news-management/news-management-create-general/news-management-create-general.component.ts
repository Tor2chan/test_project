
import { Component, EventEmitter, Input, Output, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { MODE_PAGE, MODE_PAGE_CHILDE, LOOKUP_CATALOG, DropdownData } from 'src/app/models/common';
import { DropdownService } from 'src/app/services/dropdown.service';
import { NewsManagementService } from 'src/app/services/news-management.service';
import { NewsInfoData } from 'src/app/models/news-management/NewsInfoData';
import { NewsInfoAttachData } from 'src/app/models/news-management/NewsInfoAttachData';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { ToastCloseEvent } from 'primeng/toast';
import { TablePageEvent } from 'primeng/table';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { GlobalService } from 'src/app/services/global-service.service';
@Component({
    selector: 'app-news-management-create-general',
    templateUrl: './news-management-create-general.component.html',
    styleUrls: ['./news-management-create-general.component.scss']
})


export class NewsManagementCreateGeneralComponent implements DoCheck, OnInit {
    showError: boolean = false;
    initForm: boolean = true;
    processing: boolean = false;
    lang: string;

    clickNewsStart: boolean = false;
    clickNewsEnd: boolean = false;

    @Input() item!: NewsInfoData;
    items: NewsInfoAttachData[] = [];
    temp: NewsInfoAttachData;
    totalRecords: number = 0;

    editData: NewsInfoAttachData = {
        newsAttachId: null,
        newsId: null,
        prefix: null,
        filename: null,
        module: null,
        fileNameTh: null,
        fileNameEn: null,
        type: 'file',
        activeFlag: true
    };
    isImageSizeValid: boolean = false;
    showErrorOverImg: boolean = false;
    showUpload: boolean = true;
    editRownum: number;

    @Input() mode: MODE_PAGE;
    @Output() backToListPage = new EventEmitter();

    news_information: MenuItem;

    newsFormatList: DropdownData[] = [];

    modeChilde: MODE_PAGE_CHILDE = 'MAIN';
    

    imgSrcRef: string = 'assets/layout/images/dummy/670x420.svg';
    imageStyle: any = {
        'max-width': '670px',
        'max-height': '420px',
        'image-resolution': '300dpi',
        'object-fit': 'contain'
    };
    imgSrc: string;

    hilightNewsList: any[] = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }];

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private newsManagementService: NewsManagementService,
        private dropdownService: DropdownService,
        private previewFileSerivce: PreviewFileService,
        private uploadFileService: UploadFileService,
        private confirmationService: ConfirmationService,
        private globalService: GlobalService
    ) {this.setItems()}

    setItems() {
        this.news_information = {
         label: this.translate.instant('newsManagement.newsInformation'),
        command: () => this.nPage('LIST')
        };
    }
    
    nPage(page: MODE_PAGE_CHILDE){
        this.backToListPage.emit('LIST');        
    }

    onBack(){
        this.backToListPage.emit();
    }
    

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchTable();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.newsFormatList = [{ value: null, nameTh: this.translate.instant('common.pleaseSelect') }];
            this.clickNewsStart = false;
            this.clickNewsEnd = false;
            this.setItems()
        }
    }
    ngOnInit(): void {
        window.scrollTo(0, 0);
        this.getDropdownNewFormat();
        this.fetchTable();
        this.setItems()
    }

    getDropdownNewFormat() {
        this.dropdownService
            .getLookup({ displayCode: false, id: LOOKUP_CATALOG.NEWS_FORMAT })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.newsFormatList = entries;
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

    onSave() {
        this.processing = true;
        this.loaderService.start();

        if (this.item.newFlag) {
            if (!!!this.item.newIconStart || !!!this.item.newIconEnd) {
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
        } else if (
            !!!this.item.newsFormat ||
            !!!this.item.newsHeading ||
            !!!this.item.newsDetail ||
            !!!this.item.filename ||
            !!!this.item.newsStart ||
            !!!this.item.newsEnd ||
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

        this.item.newsAttachDocList = this.items;

        if (this.mode === 'CREATE') {
            this.newsManagementService.postNewsInfo(this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    if (result.status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: this.translate.instant('common.alert.textSuccess'),
                            life: 2000
                        });
                    }
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
            // console.log('length :>> ', JSON.stringify(this.item).length)
            this.newsManagementService.putNewsInfo(this.item.newsId, this.item).subscribe((result) => {
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
            console.log('No content');
        }
    }

    openPage(page: MODE_PAGE_CHILDE, data?: NewsInfoAttachData) {        
        this.editData = {
            newsAttachId: null,
            newsId: this.item.newsId,
            prefix: null,
            filename: null,
            module: null,
            fileNameTh: null,
            fileNameEn: null,
            type: null,
            activeFlag: true
        };
        if (page == 'CREATE_CHILDE') {
            this.modeChilde = page;
        } else if (page == 'EDIT_CHILDE') {
            this.editRownum = data.rowNum;
            if (this.mode === 'CREATE') {
                this.editData = data;
            } else {
                if (data && data.newsAttachId) {
                    this.loaderService.start();
                    this.newsManagementService.getNewsInfoAttach(data.newsAttachId).subscribe((result) => {
                        this.loaderService.stop();
                        if (result.status === 200) {
                            this.editData = result.entries;
                            this.modeChilde = page;
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
            this.modeChilde = page;
        }
    }

    previewFile(event: NewsInfoAttachData): void {
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

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success' && event.message.id != 'subDelete') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    fetchTable(event?: TablePageEvent) {
        this.loaderService.start();
        const criteria: NewsInfoAttachData = {
            newsId: this.item.newsId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        if (this.item.newsId) {
            this.newsManagementService
                .findNewsInfoAttach(criteria) // รอ
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
            this.loadImage();
        } else {
            this.loaderService.stop();
        }
    }

    callbackChilde(data?: NewsInfoAttachData) {
        if (typeof data === 'string') {
            if (data === 'ADD') {
                this.modeChilde = 'MAIN';
                return;
            }
        }
        if (data) {    
            const isDuplicate = this.items.some(
                item => item.fileNameEn === data.fileNameEn && 
                        item.fileNameTh === data.fileNameTh && 
                        item.rowNum !== data.rowNum
            );
    
            if (isDuplicate) {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant('common.alert.duplicate'),
                    life: 2000
                });
                return;
            }
    
            if (data.rowNum) {
                this.items = this.items.map(item => 
                    item.rowNum === data.rowNum ? data : item
                );
            } else {
                // กรณีเพิ่มเอกสารใหม่
                data.rowNum = this.items.length + 1;
                this.items.push(data);
            }
        }
    
        this.modeChilde = 'MAIN';
        this.fetchTable();
    }
    onAdvancedUpload(event: FileUploadHandlerEvent) {
        this.loaderService.start();
        const file = event.files[0];

        const img = new Image();
        // img.onload = () => {
        //     if (img.naturalWidth < 670 || img.naturalHeight < 420 || img.naturalWidth > 670 || img.naturalHeight > 420) {
        //         this.messageService.add({
        //             severity: 'error',
        //             summary: this.translate.instant('common.alert.fail'),
        //             detail: this.translate.instant('common.alert.overImgNewsBanner'),
        //             life: 2000
        //         });
        //         this.showErrorOverImg = true;

        //         return;
        //     } else {
        this.uploadFileService.postBanner(file).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.item.filename = entries.filename;
                this.item.prefix = entries.prefix;
                this.item.module = entries.module;
                this.item.newsCoverimage = entries.filename;
                const extension = entries.filename.split('.')[1];
                this.imgSrc = `data:image/${extension};base64,${entries.base64}`;
                this.showUpload = false;
                this.showErrorOverImg = false;
                this.showError = false;
            }
        });
    // }};
        img.src = URL.createObjectURL(file);
        this.loaderService.stop();
    }

    onRemoveUpload(event: FileRemoveEvent, form: any) {
        this.item.filename = null;
        form.clear();
        form.uploadedFileCount = 0;
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
    onCheckImageSize(event: any) {
        // hide
        // const img = event.target;
        // if (img.naturalWidth > 670 || img.naturalHeight > 420 || img.naturalWidth < 670 || img.naturalHeight < 420) {
        //     // ตั้งค่า flag เพื่อบอกว่าภาพไม่ถูกต้อง
        //     this.isImageSizeValid = false;
        // } else {
        //     // ตั้งค่า flag เพื่อบอกว่าภาพถูกต้อง
        //     this.isImageSizeValid = true;
        // }
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

    deleteNewsInfoAttach(event: Event, item?: any) {
        this.confirmationService.confirm({
            key: 'confirm1',
            target: event.target || new EventTarget(),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('newsManagement.acceptLabel'),
            rejectLabel: this.translate.instant('newsManagement.rejectLabel'),
            accept: () => {
                this.loaderService.start();
                if (item.newsId == undefined) {
                    const index = this.items.indexOf(item);
                    if (index !== -1) {
                    this.items.splice(index, 1);

                    if (this.items.some(item => item.rowNum)) {
                        for (let i = 0; i < this.items.length; i++) {
                        this.items[i].rowNum = i + 1;
                        }
                    }
                    }
                    this.loaderService.stop();
                } else {
                    this.newsManagementService.deleteNewsInfoAttach(item).subscribe((result) => {
                        if (result.status == 200) {
                            this.loaderService.stop();
                            this.initForm = false;
                            this.messageService.add({
                                id:'subDelete',
                                severity: 'success',
                                summary: this.translate.instant('newsManagement.toastAccept'),
                                detail: this.translate.instant('newsManagement.toastAcceptMessage'),
                                life: 3000
                            });
                            this.fetchTable();

                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: this.translate.instant('common.alert.fail'),
                                detail: this.translate.instant(result.message),
                                life: 2000
                            });
                        }
                    });
                }

            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('newsManagement.toastReject'),
                    detail: this.translate.instant('newsManagement.toastRejectMessage'),
                    life: 3000
                });
            }
        });
    }

    newStatus(event: any){
        if (!event.checked){
          this.item.newIconStart = null;
          this.item.newIconEnd = null;
        }
    }

}

