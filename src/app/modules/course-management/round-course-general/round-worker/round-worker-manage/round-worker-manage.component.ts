import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { CoursepublicWorkerData } from 'src/app/models/course-management';
import { MasExternalPersonalData } from 'src/app/models/master';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-round-worker-manage',
    templateUrl: './round-worker-manage.component.html',
    styleUrls: ['./round-worker-manage.component.scss']
})
export class RoundWorkerManageComponent {
    @Input() item!: CoursepublicWorkerData;

    @Input() mode: MODE_PAGE;

    @Input() lang: string;

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;
    personalList: DropdownData[] = [];
    showError: boolean = false;

    positionList: DropdownData[] = [];

    suggestions: MasExternalPersonalData[] = [];

    @ViewChild('externalNameTh') externalNameTh: AutoComplete;
    @ViewChild('externalNameEn') externalNameEn: AutoComplete;
    @ViewChild('externalEmail') externalEmail: AutoComplete;
    @ViewChild('externalDepName') externalDepName: AutoComplete;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private courseManagementService: CourseManagementService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.lazyLoadPersonal(null, this.item.workerId);
            this.loadPosition();
            const { externalNameTh, externalNameEn, externalEmail, externalDepName } = this.item;
            if (this.externalNameTh && this.externalNameEn && this.externalEmail) {
                this.externalNameTh.inputEL.nativeElement.value = externalNameTh;
                this.externalNameEn.inputEL.nativeElement.value = externalNameEn;
                this.externalEmail.inputEL.nativeElement.value = externalEmail;
                this.externalDepName.inputEL.nativeElement.value = externalDepName;
            }
        }, 100);
    }

    onSave() {
        this.loaderService.start();
        this.processing = true;

        this.loaderService.start();
        if (this.item.workerType) {
            if (
                !!!this.item.externalNameTh ||
                !!!this.item.externalNameEn ||
                !!!this.item.externalEmail ||
                !!!this.item.positionType ||
                !!!this.item.externalDepName
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
        } else {
            if (!!!this.item.workerId || !!!this.item.positionType) {
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
        }

        if (this.mode === 'EDIT') {
            this.courseManagementService
                .putCoursepublicWorker(this.item.coursepublicWorkerId, this.item)
                .subscribe(({ status, message }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        if (this.item.workerType === null) {
                            this.item.workerType = false;
                        }
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: message,
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
        } else if (this.mode === 'CREATE') {
            this.courseManagementService.postCoursepublicWorker(this.item).subscribe(({ status, message }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: message,
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

    lazyLoadPersonal(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: false
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getPersonalDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.personalList = this.getUniqueListBy([...this.personalList, ...entries], 'value');
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

    loadPosition() {
        this.dropdownService
            .getLookup({
                displayCode: true,
                id: LOOKUP_CATALOG.POSITION
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.positionList = entries;
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

    getUniqueListBy(arr: any[], key) {
        return [...new Map(arr.map((item) => [item[key], item])).values()];
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

    onChangeWorkerType(event: CheckboxChangeEvent) {
        if (event.checked) {
            this.item.workerId = null;
        } else {
            this.item.externalNameTh = null;
            this.item.externalNameEn = null;
            this.item.externalEmail = null;
            this.item.externalDepName = null;
        }
    }

    onKeyupExternal(event?: AutoCompleteCompleteEvent) {
        const criteria: MasExternalPersonalData = {};
        if (event?.query) {
            criteria.searchText = event.query;
        }

        this.masterService.findExternalPersonal(criteria).subscribe(({ status, entries }) => {
            if (status === 200) {
                setTimeout(() => {
                    this.suggestions = entries;
                }, 1500);
            } else {
                this.suggestions = [];
            }
        });
    }

    onSelectedExternal(event: MasExternalPersonalData) {
        const { fullnameTh, fullnameEn, email, depName } = event;
        this.item.externalNameTh = fullnameTh;
        this.item.externalNameEn = fullnameEn;
        this.item.externalEmail = email;
        this.item.externalDepName = depName;

        setTimeout(() => {
            this.externalNameTh.inputEL.nativeElement.value = fullnameTh;
            this.externalNameEn.inputEL.nativeElement.value = fullnameEn;
            this.externalEmail.inputEL.nativeElement.value = email;
            this.externalDepName.inputEL.nativeElement.value = depName;
        }, 100);
    }
}
