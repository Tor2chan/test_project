import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DropdownChangeEvent, DropdownFilterEvent } from 'primeng/dropdown';
import { DropdownCriteriaData, DropdownData, IMPORT_PAYMENT_PAGE } from 'src/app/models/common';
import { DropdownService } from 'src/app/services/dropdown.service';
import { FinanceLog } from '../step-import-payment.component';
import { ToastCloseEvent } from 'primeng/toast';
import { FinancialManagementService } from 'src/app/services/financial-management.service';
import jsonToCsvExport from 'json-to-csv-export';
import { CourseManagementService } from 'src/app/services/course-management.service';
@Component({
    selector: 'app-import-payment-first',
    templateUrl: './import-payment-first.component.html',
    styleUrls: ['./import-payment-first.component.scss']
})
export class ImportPaymentFirstComponent implements OnInit {
    initForm: boolean = false;
    showError: boolean = true;
    processing: boolean = false;

    @Input() lang: string = 'th';

    @Output() openPage = new EventEmitter();
    @Output() backToList = new EventEmitter();

    coursepublicList: DropdownData[] = [];
    coursepublicId: number = 0;

    item: FinanceLog;

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private messageService: MessageService,
        private courseManagementService: CourseManagementService,
        private financialManagementService: FinancialManagementService
    ) {
        const payment = localStorage.getItem('payment');
        if (payment && Object.keys(payment).length > 0) {
            this.item = JSON.parse(payment);
            if (this.item.coursepublicId) {
                this.coursepublicId = this.item.coursepublicId;
            }
        } else {
            localStorage.setItem('payment', JSON.stringify(this.item));
            this.setStorage();
        }
    }

    ngOnInit(): void {
        this.lazyLoadCoursepublicMain();
    }

    lazyLoadCoursepublicMain(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true,
            id: 30014003 // เปิดรอบหลักสูตร
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService
            .getCoursepublicMainDropdown(dropdownCriteriaData)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.coursepublicList = entries;
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

    onNext() {
        this.processing = true;
        if (!!!this.coursepublicId) {
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
        /*
        const coursepublicId = structuredClone(this.coursepublicId);
        // 30033001 ยังไม่ยืนยันการชำระเงิน
        this.financialManagementService
            .findFinancePayment({
                paymentStatus: 30033001,
                coursepublicId: coursepublicId,
                cardType: null,
                paymentType: null
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    const datas = entries.map(
                        ({
                            coursepublicId,
                            memberId,
                            memberFirstnameTh,
                            memberLastnameTh,
                            ref1,
                            ref2,
                            paymentAmount
                        }) => {
                            return {
                                coursepublic_id: coursepublicId,
                                detail_date: null,
                                member_id: memberId,
                                member_name: `${memberFirstnameTh}  ${memberLastnameTh}`,
                                ref1: ref1,
                                ref2: ref2,
                                payment_amount: paymentAmount
                            };
                        }
                    );

                    // generate csv
                    const dataToConvert = {
                        data: datas,
                        filename: `template_import_payment_${new Date()
                            .toISOString()
                            .split('T')[0]
                            .replaceAll('-', '')}.csv`,
                        delimiter: ',',
                        headers: [
                            'coursepublic_id',
                            'detail_date',
                            'member_id',
                            'member_name',
                            'ref1',
                            'ref2',
                            'payment_amount'
                        ]
                    };
                    jsonToCsvExport(dataToConvert);

                    this.item.page = IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_SECOND;
                    this.setStorage();
                    this.openPage.emit(IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_SECOND);
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });
        */

        // this.course
        this.courseManagementService
            .getCoursepublicMain(this.coursepublicId)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    const date = new Date();

                    const day = date.getDate();
                    const month = date.getMonth() + 1; // Months are zero-based, so add 1
                    const year = date.getFullYear();
                    const hours = date.getHours();
                    const minutes = date.getMinutes();

                    // Ensure leading zeros for single-digit days, months, hours, and minutes
                    const now = `${day}/${month}/${year} ${hours.toString().padStart(2, '0')}:${minutes
                        .toString()
                        .padStart(2, '0')}`;

                    // generate csv
                    const dataToConvert = {
                        data: [
                            {
                                coursepublic_id: this.coursepublicId,
                                now,
                                pay_amount: entries.feeAmount,
                                member_id_card: '',
                                prefix: '',
                                firstname_th: '',
                                lastname_th: '',
                                firstname_en: '',
                                lastname_en: '',
                                email: '',
                                address: '',
                                org_legal_code: '',
                                org_name: '',
                                org_address: ''
                            }
                        ],
                        filename: `template_import_payment_${new Date()
                            .toISOString()
                            .split('T')[0]
                            .replaceAll('-', '')}.csv`,
                        delimiter: ',',
                        headers: [
                            'coursepublic_id',
                            'pay_datetime',
                            'pay_amount',
                            'member_id_card',
                            'prefix',
                            'firstname_th',
                            'lastname_th',
                            'firstname_en',
                            'lastname_en',
                            'email',
                            'address',
                            'org_legal_code',
                            'org_name',
                            'org_address'
                        ]
                    };
                    jsonToCsvExport(dataToConvert);

                    this.item.page = IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_SECOND;
                    this.setStorage();
                    this.openPage.emit(IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_SECOND);
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

    onBack() {
        this.backToList.emit(false);
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.item.page = IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_SECOND;
            this.setStorage();
            this.openPage.emit(IMPORT_PAYMENT_PAGE.IMPORT_PAYMENT_SECOND);
        }
        this.processing = false;
    }

    onChangeCoursepublic(event?: DropdownChangeEvent) {
        if (event.value) {
            this.item.coursepublicId = event.value;
        }
        this.setStorage();
    }

    setStorage() {
        localStorage.setItem('payment', JSON.stringify(this.item));
    }
}
