import { HttpHeaders } from '@angular/common/http';
import { FinancialManagementService } from './../../../services/financial-management.service';
import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { FinancePaymentData } from 'src/app/models/financial-management';
import { DropdownService } from 'src/app/services/dropdown.service';
import { ReportService } from 'src/app/services/report.service';
import { environment } from 'src/environments/environment';
import { ToastCloseEvent } from 'primeng/toast';
import { GlobalService } from 'src/app/services/global-service.service';

@Component({
    selector: 'app-payment-list',
    templateUrl: './payment-list.component.html',
    styleUrls: ['./payment-list.component.scss']
})
export class PaymentListComponent implements OnInit, DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    items: FinancePaymentData[] = [];
    dialogItems: any;
    editData: FinancePaymentData;
    totalRecords: number = 0;
    rows: number = 5;

    paymentTypeList: DropdownData[] = [];
    cancelReceiptChoice: any;
    cancelReceiptSelected: FinancePaymentData = {
        paymentId: null,
        cardType: null,
        paymentType: null,
        paymentStatus: null,
        studyStatus: null
    };
    criteria: FinancePaymentData = {
        cardType: null,
        paymentType: null,
        receiptDateStart: null,
        receiptDateEnd: null,
        publicNameTh: null,
        memberFirstnameTh: null,
        paymentAmountStart: null,
        paymentAmountEnd: null,
        first: 0,
        size: 5
    };
    visible: boolean = false;
    clickYearStart: boolean = false;
    clickYearEnd: boolean = false;

    constructor(
        public translate: TranslateService,
        private financialManagementService: FinancialManagementService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private confirmationService: ConfirmationService,
        private reportService: ReportService,
        private globalService: GlobalService
    ) {}

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onSearch();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit(): void {
        this.loadDropDown();
    }

    showDialog(item: FinancePaymentData) {
        this.visible = true;
        this.dialogItems = item;
        this.financialManagementService.getFinancePayment(item.paymentId).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.editData = result.entries;
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: result.message,
                    life: 2000
                });
            }
        });
        console.log(this.editData);
    }

    onUpdateCancelReceipt(id: number, cancelReceiptChoice: number) {
        this.loaderService.start();
        console.log(id, cancelReceiptChoice);
        if (cancelReceiptChoice == 30033003) {
            this.editData.paymentStatus = 30033003;
            this.editData.genCancelFlag = true;
            this.financialManagementService.putFinancePaymentVoid(id, this.editData).subscribe((result) => {
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.cancelReceipt'),
                        life: 2000
                    });
                }
            });

            console.log('1');
        } else if (cancelReceiptChoice == 30033004) {
            this.editData.paymentStatus = 30033004;
            this.editData.genCancelFlag = true;
            this.financialManagementService.putFinancePaymentVoid(id, this.editData).subscribe((result) => {
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.cancelReceipt'),
                        life: 2000
                    });
                }
            });
            console.log('2');
        } else if (cancelReceiptChoice == 30033005) {
            this.editData.paymentStatus = 30033005;
            this.editData.genCancelFlag = true;
            this.financialManagementService.putFinancePaymentVoid(id, this.editData).subscribe((result) => {
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.cancelReceipt'),
                        life: 2000
                    });
                }
            });
            console.log('3');
        }

        this.visible = false;
    }

    onClose() {
        this.visible = false;
    }
    onCloseToast(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.initForm = false;
        }
        this.loaderService.stop();
    }

    loadDropDown() {
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

    onClear() {
        this.criteria = {
            cardType: null,
            paymentType: null,
            receiptDateStart: null,
            receiptDateEnd: null,
            publicNameTh: null,
            memberFirstnameTh: null,
            paymentAmountStart: null,
            paymentAmountEnd: null,
            first: 0,
            size: 5
        };
        this.onSearch();
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

        this.financialManagementService.findFinancePayment(this.criteria).subscribe((result) => {
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

    viewDocumnet(item: FinancePaymentData) {
        return `${environment.apiUrl}/publicfile/path?fullpathname=${item.receiptOriginalCaPath}`;
    }
    getDownloadName(headers: HttpHeaders): string {
        const contentDisposition = headers.get('content-disposition');
        let fileName = contentDisposition ? contentDisposition.split(';')[1].split('=')[1] : `document`;
        if (fileName.startsWith('UTF')) {
            fileName = decodeURIComponent(fileName.substring(7));
        }
        return fileName;
    }

    viewDocumnetAjax(item: FinancePaymentData) {
        const { receiptCopyCaPath, receiptOriginalCaPath, memberReceiptViewFlag, paymentId } = item;

        let path = receiptCopyCaPath;

        if (!memberReceiptViewFlag) {
            path = receiptOriginalCaPath;
            item.memberReceiptViewFlag = true;
            this.financialManagementService.putFinancePaymentMemberReceiptViewFlag(paymentId, item).subscribe();
        }
        // return `${environment.apiUrl}/publicfile/path?fullpathname=${item.receiptOriginalCaPath}`;
        this.reportService.downloaod(path).subscribe({
            next: (result) => {
                if (result?.body && result?.headers) {
                    this.onSearch();
                    // saveAs(result.body, this.getDownloadName(result.headers));

                    const data = window.URL.createObjectURL(result.body);
                    this.globalService.openTargetBlank(data);
                }
            },
            error: (err) => {
                const { status, messages } = err;
                if (messages) {
                    const messageLog = [, , messages];
                    // this.alertServices.onError(...messageLog);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: `${messages}`,
                        life: 2000
                    });
                }
            }
        });
    }
    onExportExcel(data: FinancePaymentData) {
        this.loaderService.start();
        this.criteria.mode = 'excelbase64';

        this.reportService.findPaymentDataExportList(this.criteria).subscribe(({ status, message, entries }) => {
            this.loaderService.stop();
            if (status === 200) {
                console.log('export');

                var link = document.createElement('a');
                document.body.appendChild(link);
                link.setAttribute('type', 'hidden');
                link.href = 'data:application/octet-stream;charset=utf-8;base64,' + entries;
                //console.log('entries :>> ', entries);
                link.download = `ส่งออกข้อมูลการชำระเงิน-${new Date().toJSON().slice(0, 10).replace(/-/g, '')}.xlsx`;
                link.click();
                document.body.removeChild(link);
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

    onProcess(item: FinancePaymentData): void {
        const { ref1 } = item;
        const value: string = `order=${ref1}`;
        this.financialManagementService.postInquiry(value).subscribe(({ status, message }) => {
            if (status === 200) {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.alert.success'),
                    detail: this.translate.instant('common.alert.success'),
                    life: 2000
                });
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
