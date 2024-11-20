import { Component, DoCheck, EventEmitter, Input, OnInit, Output,  SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, MenuItem, ConfirmationService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE, MODE_PAGE_CHILDE } from 'src/app/models/common';
import { MasConsentDiscloseData, MasConsentManageData } from 'src/app/models/master';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-consent-management-manage',
    templateUrl: './consent-management-manage.component.html',
    styleUrls: ['./consent-management-manage.component.scss']
})
export class ConsentManagementManageComponent implements DoCheck, OnInit{
    initForm: boolean = true;
    showError: boolean = false;
    processing: boolean = false;

    modeChilde: MODE_PAGE_CHILDE = 'MAIN';
    lang: string;

    @Input() item!: MasConsentManageData;
    @Input() mode: MODE_PAGE;

    typeList: DropdownData[];

    items: MasConsentDiscloseData[] = [];
    totalRecords: number = 0;
    @Output() backToListPage = new EventEmitter();

    fromType: DropdownData[] = [];

    information: MenuItem;
    consentmanage: MenuItem;

    editData: MasConsentDiscloseData = {
        consentDiscloseId: null,
        consentId: null,
        consentDiscloseTh: null,
        consentDiscloseEn: null,
        activeFlag: true
    };


    editRownum: number;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private confirmationService: ConfirmationService
    ) {
    }
    ngOnInit(): void {
        window.scrollTo(0, 0);
        this.fetchTable();
    }

    getDropdownFormType() {
        this.dropdownService
            .getLookup({ displayCode: false, id: LOOKUP_CATALOG.FORM_TYPE })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.typeList = entries;
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

    setItems() {
        this.information = {
        label: this.translate.instant('common.module.master'),
        command: () => this.openPageBredcrum('LIST')
        };

        this.consentmanage = {
        label: this.translate.instant('master.consentManagement.name'),
        command: () => this.openPageBredcrum('LIST')
        };
  }

  openPageBredcrum(page: MODE_PAGE) {
    this.backToListPage.emit('LIST');
}

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchTable();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.setItems();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.setItems();
        }
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (
            !!!this.item.formNameTh ||
            !!!this.item.formNameEn ||
            !!!this.item.formType ||
            !!!this.item.versionNo ||
            !!!this.item.formDetailTh ||
            !!!this.item.formDetailEn ||
            !!!this.item.formNoteEn ||
            !!!this.item.formNoteTh

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

        this.item.masConsentDiscloseList = this.items;

        if (this.mode === 'CREATE') {
            this.masterService.postConsentManagement(this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                }  else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(result.message),
                        life: 2000
                    });
                }
            });
        } else if (this.mode === 'EDIT') {
            this.masterService.putConsentManage(this.item.consentId, this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
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

    openPage(page: MODE_PAGE_CHILDE, data?: MasConsentDiscloseData) {
        this.editData = {
            consentDiscloseId: null,
            consentId: this.item.consentId,
            consentDiscloseTh: null,
            consentDiscloseEn: null,
            activeFlag: true
        };

        if (page == 'CREATE_CHILDE') {
            this.modeChilde = page;
        } else if (page == 'EDIT_CHILDE') {
            this.editRownum = data.rowNum;
            if (this.mode === 'CREATE') {
                this.editData = data;
            } else {
                if (data && data.consentDiscloseId) {
                    this.loaderService.start();
                    this.masterService.getMasConsentDisclose(data.consentDiscloseId).subscribe((result) => {
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
                }
            }
            this.modeChilde = page;
        }
    }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success' && event.message.id != 'subDelete') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    fetchTable(event?: TablePageEvent) {
        this.loaderService.start();
        const criteria: MasConsentDiscloseData = {
            consentId: this.item.consentId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        if (this.item.consentId) {
            this.masterService
                .findConsentDisclose(criteria) // รอ
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
        } else {
            this.loaderService.stop();
        }
    }

    callbackChilde(data?: MasConsentDiscloseData) {
        if (data) {
            if (this.items.length == 0) {
                data.rowNum = 1;
                this.items.push(data);
            } else {
                let list: MasConsentDiscloseData[] = structuredClone(this.items);

                // check duplicate
                if (data.rowNum) {
                    list = list.filter(({ rowNum }) => rowNum != this.editRownum);
                    const count = list.filter(({ consentDiscloseTh }) => `${consentDiscloseTh}`).length;
                    if (count > 0) {
                        // duplicate
                        this.loaderService.start();
                        console.log('1');
                        // this.messageService.add({
                        //     severity: 'error',
                        //     summary: this.translate.instant('common.alert.fail'),
                        //     detail: this.translate.instant('common.alert.dupplicate'),
                        //     life: 2000
                        // });
                        this.loaderService.stop();
                        this.items = this.items.map((o) => {
                            if (o.rowNum == this.editRownum) {
                                o = data;
                            }
                            return o;
                        });
                    }
                } else {
                    const count = list.filter(({ consentDiscloseTh }) => `${consentDiscloseTh}`).length;
                    if (count > 0) {
                        // duplicate
                        this.loaderService.start();
                        // this.messageService.add({
                        //     severity: 'error',
                        //     summary: this.translate.instant('common.alert.fail'),
                        //     detail: this.translate.instant('common.alert.dupplicate'),
                        //     life: 2000

                        // });
                        this.loaderService.stop();
                        data.rowNum = this.items.length + 1;
                        this.items.push(data);
                    }
                }
            }
        }
        this.modeChilde = 'MAIN';
        this.fetchTable();
    }

    deleteConsentDisclose(event: Event, item?: any) {
        this.confirmationService.confirm({
            key: 'confirm1',
            target: event.target || new EventTarget(),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('newsManagement.acceptLabel'),
            rejectLabel: this.translate.instant('newsManagement.rejectLabel'),
            accept: () => {
                this.loaderService.start();
                if (item.consentId == undefined) {
                    const index = this.items.indexOf(item);
                    if (index !== -1) {
                    this.items.splice(index, 1);

                    if (this.items.some(item => item.rowNum)) {
                        for (let i = 0; i < this.items.length; i++) {
                        this.items[i].rowNum = i + 1;
                        }
                    }
                    }
                    this.loaderService.stop();
                } else {
                this.masterService.deleteConsentDisclose(item).subscribe((result) => {
                    if (result.entries.length) {
                        this.loaderService.stop();
                        this.initForm = false;
                        this.messageService.add({
                            severity: 'warn',
                            detail: this.translate.instant('common.alert.dupeConsent'),
                            life: 3000
                        });
                        // this.fetchTable();
                    } else {
                        this.loaderService.stop();
                        this.initForm = false;
                        this.messageService.add({
                            id:'subDelete',
                            severity: 'success',
                            summary: this.translate.instant('newsManagement.toastAccept'),
                            detail: this.translate.instant('newsManagement.toastAcceptMessage'),
                            life: 3000
                        });

                    }
                });
            }
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('newsManagement.toastReject'),
                    detail: this.translate.instant('newsManagement.toastRejectMessage'),
                    life: 3000
                });
            }
        });
    }
}
