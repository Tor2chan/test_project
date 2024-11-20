import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MODE_PAGE, DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { MasterService } from 'src/app/services/master.service';
import { MasBankChargeData } from 'src/app/models/master';
import { TablePageEvent } from 'primeng/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownService } from 'src/app/services/dropdown.service';
@Component({
    selector: 'app-fee-list',
    templateUrl: './fee-list.component.html',
    styleUrls: ['./fee-list.component.scss']
})
export class FeeListComponent implements DoCheck, OnInit {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    criteria: MasBankChargeData = {
        cardType: null,
        startYearList: []
    };

    items: MasBankChargeData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: MasBankChargeData;

    paymentTypeList: DropdownData[] = [];
    cardTypeList: DropdownData[] = [];

    //temp
    startYearListTemp: Date[];
    startYearSingleTemp: Date;

    clickYear: boolean = false;

    clickStartYearSingleTemp: boolean = false;

    constructor(
        public translate: TranslateService,
        public masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService
    ) {}

    ngOnInit(): void {
        this.loadDropDown();
        this.onSearch();
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: true,
                id: LOOKUP_CATALOG.CARD_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.cardTypeList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });

        this.dropdownService
            .getLookup({
                displayCode: true,
                id: LOOKUP_CATALOG.PAYMENT_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.paymentTypeList = entries;
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

    ngDoCheck() {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onClear();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.clickYear = false;
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

        this.masterService.findBankCharge(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
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

    openPage(page: MODE_PAGE, id?: number) {
        if (page == 'CREATE') {
            this.editData = {
                cardType: null,
                chargeId: null,
                chargeRate: null,
                paymentType: null,
                startYear: null,
                activeFlag: true
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.masterService.getBankCharge(id).subscribe((result) => {
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
        this.startYearListTemp = null;
        this.startYearSingleTemp = null;
        this.criteria = {
            paymentType: null,
            cardType: null,
            startYear: null,
            startYearList: []
        };
        this.onSearch();
    }

    // select between
    selectStartYear(value: Date[]) {
        if (value.length === 0) {
            return;
        }
    }

    // select single
    selectStartYearSingle(event) {
        const year = this.startYearSingleTemp.getFullYear() + 543;
        this.criteria.startYearList = [null, null];
        this.criteria.startYearList[0] = new Date(year,0,1);
        this.clickStartYearSingleTemp = false;




    }
}
