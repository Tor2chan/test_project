import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MODE_PAGE, LOOKUP_CATALOG, DropdownData } from 'src/app/models/common';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { UploadFileService } from 'src/app/services/upload-file.service';
@Component({
    selector: 'app-notification-manage',
    templateUrl: './notification-manage.component.html',
    styleUrls: ['./notification-manage.component.scss']
})
export class NotificationManageComponent {
    @Input() lang: string;
    @Input() mode: MODE_PAGE = 'EDIT';
    @Output() goBack = new EventEmitter();
    notiInfo: any;
    receiverList: any[] = [];
    topicList: any[] = [];
    newsFormatList: DropdownData[] = [];
    showError: boolean = false;
    showUpload: boolean = true;
    fileSizeExceeded: boolean = false;
    showErrorFile: boolean = false;
    criteria: any = {
        topic: null,
        receiver: null,
        detail: null,
        status: null,
        fileName: null,
        templateFilePath: null,
        first: 0,
        size: 5
    };

    fileSize: any;
    processing: boolean = false;

    uploadedFiles: any[] = [];

    @ViewChild('fileUpload') fileUpload: any;

    clickNewsStart: boolean = false;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private confirmationService: ConfirmationService,
        private uploadFileService: UploadFileService,
        private masterService: MasterService
    ) {}
    ngOnInit(): void {
        this.notiInfo = JSON.parse(localStorage.getItem('notiInfo'));
        if (this.notiInfo.templateFileName){
            this.showUpload = false;
        }
        this.loadDropDownReceiverList();
        this.loadDropDownTopicList();
        this.loadDropDown();
        // this.onSearch()
    }
    loadDropDownReceiverList() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.NOTI_RECEIVER_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.receiverList = entries;
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
    loadDropDownTopicList() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.NOTI_TOPIC
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.topicList = entries;
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
    onSave(event: Event, item?: any) {
        this.processing = true;
        if (
            !!!this.notiInfo.notiSubject ||
            !!!this.notiInfo.notiSubject ||
            !!!this.notiInfo.templateFilePath ||
            !!!this.notiInfo.templateFilePath ||
            !!!this.notiInfo.templateFileName ||
            !!!this.notiInfo.templateFileName ||
            !!!this.notiInfo.notiRuntimeFormat ||
            !!!this.notiInfo.notiRuntimeFormat ||
            !!!this.notiInfo.notiStartTimestamp ||
            !!!this.notiInfo.notiStartTimestamp
        ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            this.processing = false;
            return;
        }
        if (this.fileSize != undefined) {

            if(this.fileSize > 5242880) {
                this.fileSizeExceeded = true;
              //  this.showErrorFile = true;
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant('common.alert.fileUploadSizeNotification'),
                    life: 2000
                });
                this.loaderService.stop();
                return;
            }
            }
        this.confirmationService.confirm({
            key: 'confirm1',
            target: event.target || new EventTarget(),
            icon: 'pi pi-exclamation-triangle',
            header: this.translate.instant('userManagement.member.form.confirm'),
            acceptLabel: this.translate.instant('common.button.ok'),
            rejectLabel: this.translate.instant('common.button.cancel'),
            accept: () => {
                if (item.notiStartTimestamp != undefined) {
                    item.notiNextRuntime = item.notiStartTimestamp;
                    item.notiLastRuntime = undefined;
                }
                this.masterService.updateNotiDetail(item).subscribe((result) => {
                    if (result.status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: result.message,
                            life: 2000
                        });
                        this.onBack();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: result.message,
                            life: 2000
                        });
                    }
                });
            },
            reject: () => {}
        });
    }

    onBack() {
        this.goBack.emit('LIST');
    }

    downloadFile() {
        this.masterService.getHtmlFileBase64(this.notiInfo.notiId).subscribe((result) => {
            let link = document.createElement('a');
            document.body.appendChild(link);
            link.setAttribute('type', 'hidden');
            link.href = 'data:application/octet-stream;charset=utf-8;base64,' + result.entries;
            link.download = this.notiInfo.templateFileName;
            link.click();
            document.body.removeChild(link);
        });
    }

    onAdvancedUpload(event: FileUploadHandlerEvent) {
        this.loaderService.start();
        // form.clear();
        // this.notiInfo.templateFileName = null;
        // this.notiInfo.templateFilePath = null;
        // form.uploadedFileCount = 0;
        const file = event.files[0];
        const fileSize = event.files[0].size;
        this.fileSize = fileSize;
        if (fileSize > 5242880) {
            this.fileSizeExceeded = true;
            this.showErrorFile = true; // แสดงข้อความเตือน

            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.alert.fileUploadSizeNotification'),
                life: 2000
            });
        } else {
            this.fileSizeExceeded = false;
            this.showErrorFile = false;
        }
        this.uploadFileService.postNoti(file).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.criteria.templateFilePath = entries.fullpath;
                this.notiInfo.templateFilePath = entries.fullpath;
                this.notiInfo.templateFileName = entries.originalFilename;
                this.criteria.fileName = entries.originalFilename;
                this.showUpload = false
            }
        });
        this.loaderService.stop();
    }

    // onRemoveUpload(event: FileRemoveEvent, form: any) {
    //   form.clear();
    //   this.notiInfo.templateFileName = null;
    //   this.notiInfo.templateFilePath = null;
    //   form.uploadedFileCount = 0;
    // }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.NOTI_RUNTIME_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.newsFormatList = entries;
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
