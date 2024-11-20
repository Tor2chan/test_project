import { ToastCloseEvent } from 'primeng/toast';
import { MessageService, MenuItem} from 'primeng/api';
import { Component, DoCheck, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MasOccupationData, MasOccupationSkillData } from 'src/app/models/master';
import { DropdownCriteriaData, DropdownData, MODE_PAGE, MODE_PAGE_CHILDE } from 'src/app/models/common';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';
import { TablePageEvent } from 'primeng/table';

@Component({
    selector: 'app-occupation-manage',
    templateUrl: './occupation-manage.component.html',
    styleUrls: ['./occupation-manage.component.scss']
})
export class OccupationManageComponent implements DoCheck, OnInit {
    showError: boolean = false;
    initForm: boolean = true;
    processing: boolean = false;
    lang: string;

    @Input() item!: MasOccupationData;
    @Input() mode: MODE_PAGE;

    @Output() backToListPage = new EventEmitter();

    editData: MasOccupationSkillData = {
        occSkillId: null,
        occupationId: null,
        occSkillLevel: null,
        generalSkillId: null,
        activeFlag: true
    };

    editRownum: number;

    occupationGroupList: DropdownData[] = [];

    items: MasOccupationSkillData[] = [];
    totalRecords: number = 0;

    modeChilde: MODE_PAGE_CHILDE = 'MAIN';

    item1: MenuItem;
    item2: MenuItem;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService
    ) {
        this.lazyLoadOccupationGroup(null);
        this.setItems();
    }

    setItems() {
        this.item1 = {
            label: this.translate.instant('common.module.master'),
            command: () => this.openFirstPage('LIST')
        }

        this.item2 = {
            label: this.translate.instant('master.occupantion.name'), 
            command: () => this.openFirstPage('LIST')
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.setItems();
        }
    }

    openFirstPage(page: MODE_PAGE) {
        this.backToListPage.emit('LIST');
    }

    ngOnInit(): void {
        this.fetchTable();
        console.log('refresh LV2 :>> ');
    }

    ngDoCheck() {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchTable();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.setItems();
        }
    }
    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (
            (!!!this.item.occupationCode && this.mode === 'EDIT') ||
            !!!this.item.occupationNameTh ||
            !!!this.item.occupationNameEn
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

        this.item.occupationSkills = this.items;

        console.log('this.item :>> ', this.item);

        // return;

        if (this.mode === 'CREATE') {
            this.masterService.postOccupation(this.item).subscribe((result) => {
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
            // console.log('this.item :>> ', this.item);
            this.masterService.putOccupation(this.item.occupationId, this.item).subscribe((result) => {
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

    openPage(page: MODE_PAGE_CHILDE, data?: MasOccupationSkillData) {
        this.editData = {
            occSkillId: null,
            occupationId: this.item.occupationId,
            occSkillLevel: null,
            generalSkillId: null,
            activeFlag: true
        };

        if (page == 'CREATE_CHILDE') {
            this.modeChilde = page;
            console.log('this.modeChilde (click create LV2):>> ', this.modeChilde);
        } else if (page == 'EDIT_CHILDE') {
            this.editRownum = data.rowNum;
            if (this.mode === 'CREATE') {
                this.editData = data;
            } else {
                if (data && data.occSkillId) {
                    this.loaderService.start();
                    this.masterService.getOccupationSkill(data.occSkillId).subscribe((result) => {
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
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    lazyLoadOccupationGroup(event: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService
            .getOccupationGroupDropdown(dropdownCriteriaData)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.occupationGroupList = entries;
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

    callbackChilde(data?: MasOccupationSkillData) {
        console.log('data at callbankChile LV 2 :>> ', data);
        if (data) {
            if (this.items.length == 0) {
                data.rowNum = 1;
                this.items.push(data);
            } else {
                const { generalSkillId, occSkillLevel } = data;
                const key = `${generalSkillId}-${occSkillLevel}`;
                let list: MasOccupationSkillData[] = structuredClone(this.items);

                // check duplicate
                if (data.rowNum) {
                    list = list.filter(({ rowNum }) => rowNum != this.editRownum);
                    const count = list.filter(
                        ({ generalSkillId, occSkillLevel }) => `${generalSkillId}-${occSkillLevel}` == key
                    ).length;
                    if (count > 0) {
                        // duplicate
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant('common.alert.dupplicate'),
                            life: 2000
                        });
                        return;
                    }
                    this.items = this.items.map((o) => {
                        if (o.rowNum == this.editRownum) {
                            o = data;
                        }
                        return o;
                    });
                } else {
                    const count = list.filter(
                        ({ generalSkillId, occSkillLevel }) => `${generalSkillId}-${occSkillLevel}` == key
                    ).length;
                    if (count > 0) {
                        // duplicate
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant('common.alert.dupplicate'),
                            life: 2000
                        });
                        return;
                    }
                    data.rowNum = this.items.length + 1;
                    this.items.push(data);
                }
            }
        }
        this.modeChilde = 'MAIN';
        this.fetchTable();
    }

    fetchTable(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: MasOccupationSkillData = {
            occupationId: this.item.occupationId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        if (this.item.occupationId) {
            this.masterService.findOccupationSkill(criteria).subscribe(({ status, message, entries, totalRecords }) => {
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
}
