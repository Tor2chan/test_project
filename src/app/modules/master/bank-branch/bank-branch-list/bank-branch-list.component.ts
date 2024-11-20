import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MODE_PAGE, DropdownData, DropdownCriteriaData } from 'src/app/models/common';
import { MasterService } from '../../../../services/master.service';
import { MasBankBranchData } from 'src/app/models/master';
import { TablePageEvent } from 'primeng/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownService } from 'src/app/services/dropdown.service';
import { DropdownFilterEvent } from 'primeng/dropdown';

@Component({
    selector: 'app-bank-branch-list',
    templateUrl: './bank-branch-list.component.html',
    styleUrls: ['./bank-branch-list.component.scss']
})
export class BankBranchListComponent implements DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    criteria: MasBankBranchData = {
        bankBranchCode: null,
        bankBranchId: null,
        bankId: null,
        bankBranchNameTh: null,
        bankBranchNameEn: null
    };

    items: MasBankBranchData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: MasBankBranchData;

    activeFlagList: DropdownData[];
    bankList: DropdownData[] = [];

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
                    detail: message,
                    life: 2000
                });
            }
        });
    }

    displayBank(bankId: number | null): string {
        if (this.bankList.length > 0 && bankId) {
            return this.bankList.filter(({ value }) => value == bankId)[0]?.nameTh;
        }
        return '';
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

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    onSearch(event?: TablePageEvent) {
        this.loaderService.start();

        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
            if (event.rows !== this.rows) {
                this.backToFirstPage();
            }
        } else {
            this.backToFirstPage();
        }

        this.masterService.findBankBranch(this.criteria).subscribe((result) => {
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
                bankId: null,
                bankBranchId: null,
                bankBranchCode: '',
                bankBranchNameTh: '',
                bankBranchNameEn: '',
                activeFlag: true
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.masterService.getBankBranch(id).subscribe((result) => {
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
            bankBranchNameEn: null,
            bankBranchNameTh: null,
            bankBranchCode: null,
            activeFlag: null
        };
        this.onSearch();
    }
}
