
import { Component, DoCheck, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE_CHILDE } from 'src/app/models/common';
import { MasBankChargeAttachData } from 'src/app/models/master';
import { MasterService } from 'src/app/services/master.service';
import { UploadFileService } from 'src/app/services/upload-file.service';

@Component({
    selector: 'app-fee-attach',
    templateUrl: './fee-attach.component.html',
    styleUrls: ['./fee-attach.component.scss']
  })
  export class FeeAttachComponent implements DoCheck {
    valueString: string = '';
    activeFlag: boolean = true;

    showError: boolean = false;

    lang: string;

    @Input() modeChilde: MODE_PAGE_CHILDE = 'MAIN';
    @Input() item!: MasBankChargeAttachData;

    @Output() backToMain = new EventEmitter();

    processing: boolean = false;

    @ViewChild('fileUpload') fileUpload: any;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private masterService: MasterService,
        private uploadFileService: UploadFileService
    ) {}

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }
    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (!!!this.item.fileName) {
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

        if (this.modeChilde === 'CREATE_CHILDE') {
            console.log('this.item.chargeId :>> ', this.item.chargeId);

        }

        // if (this.item.chargeAttachId) {
        //     this.masterService.putBankChargeAttach(this.item.chargeAttachId, this.item).subscribe((result) => {
        //         this.loaderService.stop();
        //         if (result.status === 200) {
        //             this.item = result.entries;
        //             this.backToMain.emit(this.item);

        //         } else if (result.status === 204) {
        //             this.messageService.add({
        //                 severity: 'error',
        //                 summary: this.translate.instant('common.alert.fail'),
        //                 detail: this.translate.instant(result.message),
        //                 life: 2000
        //             });
        //         } else {
        //             this.messageService.add({
        //                 severity: 'error',
        //                 summary: this.translate.instant('common.alert.fail'),
        //                 detail: this.translate.instant(result.message),
        //                 life: 2000
        //             });
        //         }
        //     });
        // } else if (this.item.chargeId) {
        //     this.masterService
        //         .postBankChargeAttach(this.item)
        //         .subscribe((result) => {
        //             this.loaderService.stop();
        //             if (result.status === 200) {
        //                 this.item = result.entries;
        //                 this.backToMain.emit(this.item);

        //             } else if (result.status === 204) {
        //                 this.messageService.add({
        //                     severity: 'error',
        //                     summary: this.translate.instant('common.alert.fail'),
        //                     detail: this.translate.instant(result.message),
        //                     life: 2000
        //                 });
        //             } else {
        //                 this.messageService.add({
        //                     severity: 'error',
        //                     summary: this.translate.instant('common.alert.fail'),
        //                     detail: result.message,
        //                     life: 2000
        //                 });
        //             }
        //         });
        // } else {
        //     console.log('else');
        // }
    }

    onBack() {
        this.backToMain.emit();
    }

    onCloseLevel2(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToMain.emit();
        }
        this.processing = false;
    }

    onAdvancedUpload(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        this.uploadFileService.postCourse(file)
        .subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.item.fileName = entries.filename;
            }
        })
    }
    onRemoveUpload(event: FileRemoveEvent, form: any) {
        this.item.fileName = null;
        form.clear();
        form.uploadedFileCount = 0;
    }
}
