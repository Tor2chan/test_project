import { Component, DoCheck, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { MasBankData } from 'src/app/models/master';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-bank-manage',
    templateUrl: './bank-manage.component.html',
    styleUrls: ['./bank-manage.component.scss']
})
export class BankManageComponent implements DoCheck {
    showError: boolean = false;
    lang: string;
    @Input() item!: MasBankData;
    @Input() mode: MODE_PAGE;

    @Output() backToListPage = new EventEmitter();

    // @Output() pushBankBranch = new EventEmitter();

    processing: boolean = false;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService
    ) {}

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (!!!this.item.bankCode || !!!this.item.bankNameTh || !!!this.item.bankNameEn) {
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

        if (this.mode === 'CREATE') {
            this.masterService.postBank(this.item).subscribe((result) => {
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
            this.masterService.putBank(this.item.bankId, this.item).subscribe((result) => {
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

    // addBankBranch() {

    //     if (
    //          !!!this.bankBranchCode ||
    //          !!!this.bankBranchNameTh ||
    //          !!!this.bankBranchNameEn  ) {
    //             this.showError = true;
    //             this.messageService.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: 'กรุณาระบุข้อมูลให้ครบถ้วน' ,life: 2000});

    //          }

    //     else {
    //         console.log('save')
    //         this.isLoading = true;
    //         this.messageService.add({ severity: 'success', summary: 'สำเร็จ', detail: 'บันทึกสำเร็จ' ,life: 2000});

    //         const data = {
    //             bankBranchCode: this.bankBranchCode,
    //             bankBranchNameTh: this.bankBranchNameTh,
    //             bankBranchNameEn: this.bankBranchNameEn,
    //         }
    //         console.log('data :>> ', data);

    //         this.pushBankBranch.emit({ data })

    //     }

    // }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }
}
