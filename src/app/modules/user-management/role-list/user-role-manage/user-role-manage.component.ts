import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { AutRoleData, AutUserData } from 'src/app/models/user-management';
import { DropdownService } from 'src/app/services/dropdown.service';
import { UserManagementService } from 'src/app/services/user-management.service';

@Component({
    selector: 'app-user-role-manage',
    templateUrl: './user-role-manage.component.html',
    styleUrls: ['./user-role-manage.component.scss']
})
export class UserRoleManageComponent {
    @Input() roleId: number;
    @Input() name: string;

    @Input() lang: string = 'th';
    @Input() mode: MODE_PAGE;

    @Output() backToListPage = new EventEmitter();

    initForm: boolean = false;
    processing: boolean = false;

    departmentLevel1List: DropdownData[] = [];

    selectDatas: AutUserData[] = [];

    criteria: AutUserData = {
        isExists: false,
        username: null,
        email: null,
        firstnameTh: null,
        depIdLevel1: null,
        first: 0,
        size: 5
    };

    items: AutUserData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private userManagementService: UserManagementService,
        private dropdownService: DropdownService
    ) {}

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onClear();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit(): void {
        this.lazyLoadDepartmentLevel1();
    }

    getUniqueListBy(arr: any[], key) {
        return [...new Map(arr.map((item) => [item[key], item])).values()];
    }

    lazyLoadDepartmentLevel1(event?: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009001,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLevel1List = this.getUniqueListBy([...this.departmentLevel1List, ...entries], 'value');
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

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    fetchData(event?: TablePageEvent) {
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

        this.userManagementService
            .findUserRole(this.criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.items = entries;
                    this.totalRecords = totalRecords;
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
        console.log('this.roleId :>> ', this.roleId);
        this.criteria = {
            roleId: this.roleId,
            isExists: false,
            username: null,
            email: null,
            firstnameTh: null,
            depIdLevel1: null,
            first: 0,
            size: 5
        };
        this.fetchData();
    }

    openPage(page: MODE_PAGE) {
        if (page == 'CREATE') {
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        }
    }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onSave() {
        this.processing = true;
        if (this.selectDatas.length == 0) {
            this.processing = false;
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('common.alert.fail'),
                detail: 'กรุณาเลือกอย่างน้อย 1 รายการ',
                life: 2000
            });
        }

        const autRoleData: AutRoleData = {
            roleId: this.roleId,
            userList: this.selectDatas
        };

        this.loaderService.start();
        this.userManagementService.postUserRole(autRoleData).subscribe(({ status, message }) => {
            this.loaderService.stop();
            this.initForm = false;
            if (status === 200) {
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
                    detail: message,
                    life: 2000
                });
            }
        });
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }
}
