import { Component, DoCheck, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownData, MODE_PAGE } from 'src/app/models/common';
import { AutRoleData } from 'src/app/models/user-management';
import { UserManagementService } from 'src/app/services/user-management.service';

@Component({
    selector: 'app-role-list',
    templateUrl: './role-list.component.html',
    styleUrls: ['./role-list.component.scss']
})
export class RoleListComponent implements OnInit, DoCheck {
    initForm: boolean = false;

    lang: string = 'th';

    mode: MODE_PAGE = 'LIST';

    activeFlagList: DropdownData[] = [];

    criteria: AutRoleData = {
        activeFlag: null,
        name: null,
        first: 0,
        size: 5
    };

    items: AutRoleData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: AutRoleData;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private userManagementService: UserManagementService,
        private router: Router
    ) {}

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onClear();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.activeFlagList = [
                { value: true, nameTh: this.translate.instant('common.status.active') },
                { value: false, nameTh: this.translate.instant('common.status.inActive') },
                { value: null, nameTh: this.translate.instant('common.status.all') }
            ];
        }
    }

    ngOnInit(): void {
        this.activeFlagList = [
            { value: true, nameTh: this.translate.instant('common.status.active') },
            { value: false, nameTh: this.translate.instant('common.status.inActive') },
            { value: null, nameTh: this.translate.instant('common.status.all') }
        ];
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

        this.userManagementService.findRole(this.criteria).subscribe(({ status, message, entries, totalRecords }) => {
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

    onClear() {
        this.criteria = {
            activeFlag: null,
            name: null,
            first: 0,
            size: 5
        };
        this.fetchData();
    }

    openPage(page: MODE_PAGE, id?: number, name?: string) {
        if (page == 'CREATE') {
            this.loaderService.start();
            this.userManagementService.getRole(null).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.editData = result.entries;
                    this.mode = page;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: result.message,
                        life: 2000
                    });
                }
            });
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.userManagementService.getRole(id).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.editData = result.entries;
                    this.mode = page;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: result.message,
                        life: 2000
                    });
                }
            });
        } else if (page == 'MANY') {
            let navigationExtras: NavigationExtras = {
                queryParams: {
                    data: this.encodeBase64(
                        JSON.stringify({
                            roleId: id,
                            name
                        })
                    )
                }
            };

            this.router.navigate(['/user-management/user-role'], navigationExtras);
        }
    }

    encodeBase64(string) {
        const codeUnits = new Uint16Array(string.length);
        for (let i = 0; i < codeUnits.length; i++) {
            codeUnits[i] = string.charCodeAt(i);
        }
        return window.btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
    }

}
