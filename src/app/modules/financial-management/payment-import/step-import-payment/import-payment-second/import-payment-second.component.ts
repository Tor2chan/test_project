import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { IMPORT_PAYMENT_PAGE, UploadFileData } from 'src/app/models/common';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { FinanceLog } from '../step-import-payment.component';
import { TmpFinanceImportLogData } from '../../../../../models/financial-management/tmpFinanceImportLogData';
import { FinancialManagementService } from 'src/app/services/financial-management.service';

@Component({
    selector: 'app-import-payment-second',
    templateUrl: './import-payment-second.component.html',
    styleUrls: ['./import-payment-second.component.scss']
})
export class ImportPaymentSecondComponent implements OnDestroy {
    @Input() lang: string = 'th';

    @Output() openPage = new EventEmitter();

    uploadFileData: UploadFileData = {
        extension: null,
        filename: null,
        filesize: null,
        prefix: null,
        module: null,
        originalFilename: null
    };

    item: FinanceLog;

    checkQue: any;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private uploadFileService: UploadFileService,
        private financialManagementService: FinancialManagementService
    ) {
        const payment = localStorage.getItem('payment');
        if (payment && Object.keys(payment).length > 0) {
            this.item = JSON.parse(payment);
            if (this.item.uploadFileData) {
                this.uploadFileData = this.item.uploadFileData;
            }
        } else {
            this.setStorage();
        }
    }

    onAdvancedUpload(event: FileUploadHandlerEvent) {
        this.loaderService.start();
        const file = event.files[0];
        this.uploadFileService.postReceipt(file).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.uploadFileData = entries;
                this.item.uploadFileData = entries;
                this.setStorage();
                this.saveLog();
            }
        });
    }
    onRemoveUpload(event: FileRemoveEvent, form: any) {
        this.uploadFileData = {
            extension: null,
            filename: null,
            filesize: null,
            prefix: null,
            module: null,
            originalFilename: null
        };
        this.item.uploadFileData = null;
        this.setStorage();
        form.clear();
        form.uploadedFileCount = 0;
    }

    saveLog() {
        this.loaderService.start();
        const tmpFinanceImportLogData: TmpFinanceImportLogData = {
            coursepublicId: this.item.coursepublicId,
            impFileName: this.item.uploadFileData.filename,
            impFileSize: this.item.uploadFileData.filesize,
            prefix: this.item.uploadFileData.prefix,
            module: this.item.uploadFileData.module
        };
        this.financialManagementService
            .postTmpFinanceImportLog(tmpFinanceImportLogData)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.item.tmpImpId = entries.tmpImpId;
                    this.setStorage();
                    this.checkQue = setInterval(() => this.checkQ(), 2000);
                } else {
                    this.loaderService.stop();
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
    }

    checkQ() {
        this.financialManagementService
            .getTmpFinanceImportLog(this.item.tmpImpId)
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    const { activeFlag, messageError } = structuredClone(entries);
                    if (activeFlag && messageError) {
                        clearInterval(this.checkQue);
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: messageError,
                            life: 2000
                        });
                    } else if (activeFlag) {
                        clearInterval(this.checkQue);
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: this.translate.instant('common.alert.success'),
                            life: 2000
                        });
                    } else {
                        this.loaderService.start();
                    }
                } else {
                    clearInterval(this.checkQue);
                    this.loaderService.stop();
                }
            });
    }

    onNext() {
        this.item.page = IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_THIRD;
        this.setStorage();
        this.openPage.emit(IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_THIRD);
    }

    onBack() {
        this.item.page = IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_FIRST;
        this.setStorage();
        this.openPage.emit(IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_FIRST);
    }

    setStorage() {
        localStorage.setItem('payment', JSON.stringify(this.item));
    }

    ngOnDestroy(): void {
        clearInterval(this.checkQue);
        this.loaderService.stop();
    }
    
}
