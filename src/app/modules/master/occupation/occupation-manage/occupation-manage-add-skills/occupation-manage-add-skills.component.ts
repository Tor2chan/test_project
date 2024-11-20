import { Component, DoCheck, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG, MODE_PAGE_CHILDE } from 'src/app/models/common';
import { MasOccupationSkillData } from 'src/app/models/master';
import { MessageService } from 'primeng/api';
import { DropdownService } from 'src/app/services/dropdown.service';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TranslateService } from '@ngx-translate/core';
import { MasterService } from 'src/app/services/master.service';
import { ToastCloseEvent } from 'primeng/toast';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-occupation-manage-add-skills',
    templateUrl: './occupation-manage-add-skills.component.html',
    styleUrls: ['./occupation-manage-add-skills.component.scss']
})
export class OccupationManageAddSkillsComponent implements OnInit, DoCheck {
    initForm: boolean = false;

    // showError
    showError: boolean = false;

    lang: string;

    @Input() modeChilde: MODE_PAGE_CHILDE = 'MAIN';
    @Input() item!: MasOccupationSkillData;

    @Output() backToMain = new EventEmitter();

    generalSkillList: DropdownData[] = [];
    skillLevelList: DropdownData[] = [];

    processing: boolean = false;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private loaderService: NgxUiLoaderService,
        private messageService: MessageService,
        private dropdownService: DropdownService
    ) {
    }

    ngOnInit(): void {
        this.loadDropdown();
        setTimeout(() => {
            this.lazyLoadGeneralSkill(null, this.item.generalSkillId);
        }, 200);
    }
    loadDropdown() {

        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.LEVEL
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.skillLevelList = entries;
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
        if (!this.initForm) {
            this.initForm = !this.initForm;
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    lazyLoadGeneralSkill(event: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getGeneralSkillDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.generalSkillList = entries;
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

    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (!!!this.item.generalSkillId || !!!this.item.occSkillLevel) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            this.loaderService.stop();
            this.processing = false;
            return;
        }

        this.loaderService.start();
        if (this.item.occSkillId) {
            this.masterService.putOccupationSkill(this.item.occSkillId, this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.item = result.entries;
                    this.backToMain.emit(this.item);
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
        } else if (this.item.occupationId) {
            this.masterService.postOccupationSkill(this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.item = result.entries;
                    this.backToMain.emit(this.item);
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
        } else {
            console.log('else');
            const { nameTh: generalSkillNameTh, nameEn: generalSkillNameEn } = this.generalSkillList.filter(
                (o) => o.value === this.item.generalSkillId
            )[0];
            const { nameTh: levelNameTh, nameEn: levelNameEn } = this.skillLevelList.filter(
                (o) => o.value === this.item.occSkillLevel
            )[0];
            this.item = {
                ...this.item,
                generalSkillNameTh,
                generalSkillNameEn,
                levelNameTh,
                levelNameEn
            };
            this.loaderService.stop();
            this.backToMain.emit(this.item);
        }
    }

    onCloseLevel2(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToMain.emit();
        }
        this.processing = false;
    }

    onBack() {
        console.log('this.item :>> ', this.item);
        this.backToMain.emit();
    }
}
