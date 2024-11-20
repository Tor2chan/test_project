import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, MenuItem } from 'primeng/api';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE, DropdownData, LOOKUP_CATALOG, DropdownCriteriaData } from 'src/app/models/common';
import { MasterService } from 'src/app/services/master.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { UserManagementService } from 'src/app/services/user-management.service';
import { AutUserData } from 'src/app/models/user-management';
import { DropdownFilterEvent, DropdownChangeEvent } from 'primeng/dropdown';

@Component({
    selector: 'app-user-manage',
    templateUrl: './user-manage.component.html',
    styleUrls: ['./user-manage.component.scss']
})
export class UserManageComponent implements OnInit {
    showError: boolean = false;

    @Input() item!: AutUserData;
    @Input() mode: MODE_PAGE;

    @Input() lang: string = 'th';

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;

    roleList: DropdownData[] = [];
    refUserTypeList: DropdownData[] = [];
    accessLevelList: DropdownData[] = [];
    personalList: DropdownData[] = [];

    departmentLv1List: DropdownData[] = [];
    departmentLv2List: DropdownData[] = [];

    accessLevel: boolean = false;
    user: MenuItem;
    username: MenuItem;
    items: AutUserData[] = [];
    initForm: boolean = false;
    editData: AutUserData;

    constructor(
        public translate: TranslateService,
        private userManagementService: UserManagementService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService
    ) {}

    ngOnInit(): void {
        this.loadDropdown();
        setTimeout(() => {
            if (this.mode === 'CREATE') {
                this.lazyLoadPersonal(null);
            } else if (this.mode === 'EDIT') {
                this.loadAutUserData(null, this.item.refUserId)
            }
            this.lazyLoadDepartmentLv1(null, this.item.depIdLevel1);
            this.lazyLoadDepartmentLv2(null, this.item.depIdLevel2);
        }, 400);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.user = {
                label: this.translate.instant('common.module.user'),
                command: () => this.openPage('LIST')
            };
            this.username = {
                label: this.translate.instant('userManagement.user.name'),
                command: () => this.openPage('LIST')
            };
        }
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (!this.item.refUserId) {
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
            this.userManagementService.postUser(this.item).subscribe(({ status, message, entries }) => {
                console.log('status :>> ', status);
                console.log('message :>> ', message);
                this.loaderService.stop();
                if (status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                } else if (status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
        } else if (this.mode === 'EDIT') {
            this.userManagementService
                .putUser(this.item.userId, this.item)
                .subscribe(({ status, message, entries }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: this.translate.instant('common.alert.textSuccess'),
                            life: 2000
                        });
                    } else if (status === 204) {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
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
    onClear() {}
    onImport() {}

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }
    loadDropdown() {
        this.dropdownService
            .getRoleDropdown({
                displayCode: false
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.roleList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });

        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.USER_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.refUserTypeList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });

        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.ACCESS_LEVEL
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.accessLevelList = entries;
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
        return [...new Map(arr.map(item => [item[key], item])).values()]
    }

    lazyLoadPersonal(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (this.mode == 'CREATE') {
            dropdownCriteriaData.mode = 'CREATE';
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getPersonalDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.personalList = this.getUniqueListBy([
                    ...this.personalList,
                    ...entries
                ], 'value')
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

    loadAutUserData(event?: DropdownChangeEvent, id?: number) {
        let personId: number = null;
        if (event?.value) {
            personId = event.value;
        }
        if (id) {
            personId = id;
        }
        if (personId) {
            this.masterService.getPersonalUser(personId).subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.item = entries;
                    this.lazyLoadDepartmentLv1(null, this.item.depIdLevel1);
                    this.lazyLoadDepartmentLv2(null, this.item.depIdLevel2);
                } else {
                    if (event)  {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(message),
                            life: 2000
                        });
                    }
                }
            });
        }
    }

    lazyLoadDepartmentLv1(event?: DropdownFilterEvent, id?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }
        if (id) {
            dropdownCriteriaData.pkId = id;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLv1List = entries;
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

    lazyLoadDepartmentLv2(event?: DropdownFilterEvent, id?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }
        if (id) {
            dropdownCriteriaData.pkId = id;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLv2List = entries;
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

    openPage(page: MODE_PAGE) {
        this.backToListPage.emit('LIST');
    }

}
