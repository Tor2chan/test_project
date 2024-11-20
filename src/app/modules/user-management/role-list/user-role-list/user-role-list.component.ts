import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TablePageEvent } from 'primeng/table';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { AutRoleData, AutUserData } from 'src/app/models/user-management';
import { DropdownService } from 'src/app/services/dropdown.service';
import { UserManagementService } from 'src/app/services/user-management.service';

@Component({
    selector: 'app-user-role-list',
    templateUrl: './user-role-list.component.html',
    styleUrls: ['./user-role-list.component.scss']
})
export class UserRoleListComponent {
    roleId: number;
    name: string;

    initForm: boolean = false;

    lang: string = 'th';

    mode: MODE_PAGE = 'LIST';

    departmentLevel1List: DropdownData[] = [];

    selectDatas: AutUserData[] = [];

    criteria: AutUserData = {
        isExists: true,
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

    decodeBase64(encoded) {
        const binary = window.atob(encoded);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return JSON.parse(String.fromCharCode(...new Uint16Array(bytes.buffer)));
    }

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private userManagementService: UserManagementService,
        private dropdownService: DropdownService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {
        this.activatedRoute.queryParamMap.subscribe((params) => {
            const { roleId, name } = this.decodeBase64(params.get('data'));
            this.roleId = roleId;
            this.name = name;
            this.criteria.roleId = roleId;
        });
    }

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
            isExists: true,
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
        this.router.navigate(['/user-management/role']);
    }

    onDelete() {
        if (this.selectDatas.length == 0) {
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

        this.confirmationService.confirm({
            key: 'confirm1',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                this.userManagementService.putUserRole(this.roleId, autRoleData).subscribe(({ status, message }) => {
                    this.loaderService.stop();
                    this.initForm = false;
                    if (status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: this.translate.instant('common.alert.deleteSuccess'),
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
            },
            reject: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.reject'),
                    detail: this.translate.instant('common.alert.detailReject')
                });
            }
        });
    }
}
