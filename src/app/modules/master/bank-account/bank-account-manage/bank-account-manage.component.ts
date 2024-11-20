import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { MasterService } from 'src/app/services/master.service';
import { MasBankAccountData } from 'src/app/models/master';
import { DropdownService } from 'src/app/services/dropdown.service';
import { DropdownFilterEvent } from 'primeng/dropdown';
@Component({
    selector: 'app-bank-account-manage',
    templateUrl: './bank-account-manage.component.html',
    styleUrls: ['./bank-account-manage.component.scss'],
    providers: [MessageService]
})
export class BankAccountManageComponent implements DoCheck, OnInit {
    showError: boolean = false;

    item!: MasBankAccountData;

    initForm: boolean = false;

    bankList: DropdownData[] = [];
    bankBranchList: DropdownData[] = [];

    lang: string = 'th';

    /** karn */
    processing: boolean = false;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService
    ) {}

    ngOnInit(): void {}

    ngDoCheck(): void {
        if (!this.initForm) {
            this.loadModel();
            this.initForm = !this.initForm;
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    loadModel() {
        this.masterService.getBankAccountActive().subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.item = entries;
                this.loadDropDown();
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

    loadDropDown() {
        this.lazyLoadBank(null, this.item.bankId);
        this.lazyLoadBankBranch(null, this.item.bankBranchId);
    }

    lazyLoadBank(event: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getBankDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.bankList = entries;
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

    lazyLoadBankBranch(event: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (this.item && this.item.bankId) {
            dropdownCriteriaData.id = this.item.bankId;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getBankBranchDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.bankBranchList = entries;
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
        /** karn */
        this.processing = true;
        this.loaderService.start();
        if (
            !!!this.item.bankId ||
            !!!this.item.bankBranchId ||
            !!!this.item.accountNo ||
            !!!this.item.accountNameTh ||
            !!!this.item.accountNameEn ||
            !!!this.item.billerId ||
            !!!this.item.companyId
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

        this.masterService.putBankAccount(this.item.bankAccountId, this.item).subscribe((result) => {
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
    }

    onClose(event: ToastCloseEvent) {
        /** karn */
        this.processing = false;
    }
}
