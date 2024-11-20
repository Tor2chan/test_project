import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MODE_PAGE, DropdownData, DropdownCriteriaData } from 'src/app/models/common';
import { MasterService } from '../../../../services/master.service';
import { TablePageEvent } from 'primeng/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { MasBankAccountData } from 'src/app/models/master';
import { DropdownService } from 'src/app/services/dropdown.service';
import { DropdownFilterEvent } from 'primeng/dropdown';

@Component({
    selector: 'app-bank-account-list',
    templateUrl: './bank-account-list.component.html',
    styleUrls: ['./bank-account-list.component.scss']
})
export class BankAccountListComponent implements DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    criteria: MasBankAccountData = {
        bankId: null,
        bankBranchId: null,
        accountNameEn: null,
        accountNameTh: null,
        accountNo: null
    };

    items: MasBankAccountData[] = [];
    totalRecords: number = 0;

    editData: MasBankAccountData;

    activeFlagList: DropdownData[] = [];
    bankList: DropdownData[] = [];
    bankBranchList: DropdownData[] = [];

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService
    ) {
        this.loadDropDown();
    }

    loadDropDown() {
        this.lazyLoadBank(null);
        this.lazyLoadBankBranch(null);
    }

    lazyLoadBank(event: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

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
    lazyLoadBankBranch(event: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true,
            id: this.criteria.bankId
        };

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

    ngDoCheck() {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onClear();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.activeFlagList = [
                {
                    value: true,
                    nameTh: this.translate.instant('common.status.active'),
                    nameEn: this.translate.instant('common.status.active')
                },
                {
                    value: false,
                    nameTh: this.translate.instant('common.status.inActive'),
                    nameEn: this.translate.instant('common.status.inActive')
                },
                {
                    value: null,
                    nameTh: this.translate.instant('common.status.all'),
                    nameEn: this.translate.instant('common.status.all')
                }
            ];
        }
    }

    onSearch(event?: TablePageEvent) {
        this.loaderService.start();

        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
        }

        this.masterService.findBankAccount(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
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

    openPage(page: MODE_PAGE, id?: number) {
        if (page == 'CREATE') {
            this.editData = {
                bankAccountId: null,
                bankId: null,
                bankBranchId: null,
                bankAccountNote: null,
                billerId: null,
                accountNameTh: null,
                accountNameEn: null,
                accountNo: null,
                companyId: null,
                activeFlag: true
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.masterService.getBankAccount(id).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.editData = result.entries;
                    this.mode = page;
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

    onClear() {
        this.criteria = {
            bankId: null,
            bankBranchId: null,
            accountNameTh: null,
            accountNameEn: null,
            accountNo: null,
            activeFlag: null
        };
        this.onSearch();
    }
}
