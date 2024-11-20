import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MenuItem, MessageService } from 'primeng/api';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE, MODE_PAGE_CHILDE } from 'src/app/models/common';
import { MasBankChargeAttachData, MasBankChargeData } from 'src/app/models/master';
import { DropdownService } from 'src/app/services/dropdown.service';
import { GlobalService } from 'src/app/services/global-service.service';
import { MasterService } from 'src/app/services/master.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';

@Component({
    selector: 'app-fee-manage',
    templateUrl: './fee-manage.component.html',
    styleUrls: ['./fee-manage.component.scss']
})
export class FeeManageComponent implements DoCheck, OnInit {

    @Input() lang: string;

    initForm: boolean = false;
    showError: boolean = false;
    processing: boolean = false;

    @Input() item!: MasBankChargeData;
    @Input() mode: MODE_PAGE;

    @Output() backToListPage = new EventEmitter();

    paymentTypeList: DropdownData[] = [];
    cardTypeList: DropdownData[] = [];

    items: MasBankChargeAttachData[] = [];
    totalRecords: number = 0;

    editData: MasBankChargeAttachData = {
        chargeAttachId: null,
        chargeId: null,
        fileLink: null,
        fileName: null
    };

    modeChilde: MODE_PAGE_CHILDE = 'MAIN';

    startYearTemp: Date;

    clickStartYearTemp: boolean = false;

    information: MenuItem;
    fee: MenuItem;

    clickYear: boolean = false;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private previewFileSerivce: PreviewFileService,
        private globalService: GlobalService
    ) {
        this.setItems();
    }

    setItems() {
        this.information = {
            label: this.translate.instant('common.module.master'),
            command: () => this.openFirstPage('LIST')
        };

        this.fee = {
            label: this.translate.instant('master.bankBranch.name'),
            command: () => this.openFirstPage('LIST')
        };
    }
    openFirstPage(page: MODE_PAGE) {
        this.backToListPage.emit('LIST');
    }

    ngOnInit(): void {
        this.loadDropDown();
        setTimeout(() => {
            if (this.item.startYear) {
                this.startYearTemp = new Date(this.item.startYear - (this.lang === 'th' ?  0 : 543), 0, 1);

            }
        }, 200);
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

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.setItems();
            this.clickYear = false;
        }
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchData();
        }
    }

    isEmpty(value: any): boolean {
        return value === null || value === undefined || value.toString().trim() === '';
    }


    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (
            !!!this.item.paymentType ||
            this.isEmpty(this.item.chargeRate) ||
            this.isEmpty(this.item.studentChargePercent) ||
            this.isEmpty(this.item.universityChargePercent) ||
            !!!this.item.startYear
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

        if (this.mode === 'CREATE') {
            this.masterService.postBankCharge(this.item).subscribe((result) => {
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
            this.masterService.putBankCharge(this.item.chargeId, this.item).subscribe((result) => {
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

    onChangePaymentType(event: DropdownChangeEvent) {
        if (event.value === 30023001) {
            this.item.cardType = 30024001;
        } else if (event.value === 30023002) {
            this.item.cardType = 30024003;
        }
    }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    changeStartYear() {
        const year = this.startYearTemp.getFullYear();
        this.item.startYear = year + 543;
        this.clickStartYearTemp = false;


    }

    openPage(page: MODE_PAGE_CHILDE, data?: MasBankChargeAttachData) {
        this.editData = {
            activeFlag: true,
            chargeAttachId: null,
            chargeId: this.item.chargeId,
            fileLink: null,
            fileName: null
        };
        if (page == 'CREATE_CHILDE') {
            this.modeChilde = page;
        } else if (page == 'EDIT_CHILDE') {
            if (data && data.chargeAttachId) {
                this.loaderService.start();
                this.masterService.getBankChargeAttach(data.chargeAttachId).subscribe((result) => {
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
                this.fetchData();
            }
            this.modeChilde = page;
        }
    }

    callbackChilde(data?: MasBankChargeAttachData) {
        if (data) {
            this.items.push(data);
        }
        this.modeChilde = 'MAIN';
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: MasBankChargeAttachData = {
            chargeId: this.item.chargeId,
            fileName: null,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.masterService
            .findBankChargeAttach({ chargeId: this.item.chargeId })
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
    }

    previewPdf(event: MasBankChargeAttachData): void {
        console.log('event :>> ', event);
        this.loaderService.start();
        this.previewFileSerivce
            .postFile({
                filename: event.fileName
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
}
