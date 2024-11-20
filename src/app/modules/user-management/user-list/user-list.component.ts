import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MODE_PAGE, DropdownData } from 'src/app/models/common';
import { AutUserData } from 'src/app/models/user-management';
import { UserManagementService } from 'src/app/services/user-management.service';
import { MessageService} from 'primeng/api';
import { DropdownService } from 'src/app/services/dropdown.service';
import { TablePageEvent } from 'primeng/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TabViewChangeEvent } from 'primeng/tabview';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements DoCheck, OnInit {
    criteria: AutUserData = {
        username: null,
        email: null,
        firstnameTh: null,
        telephone: null,
        roleIds: null,
        activeFlag: null,
        /** บุคลากรภายใน */
        refUserType: null,
        isLocal: false
    };

    initForm: boolean = false;

    lang: string = 'th';

    editData: AutUserData;

    activeFlagList: DropdownData[] = [];
    roleList: DropdownData[] = [];

    items: AutUserData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    mode: MODE_PAGE = 'LIST';

    tabIndex: number = 0;
    /** Bilingual */
    tabs: any[] = [
        { index: 0, nameTh: 'บุคลากรภายใน', nameEn: 'Internal Personnel' },
        { index: 1, nameTh: 'สมาชิก', nameEn: 'Member' }
    ];

    constructor(
        private translate: TranslateService,
        private userManagementService: UserManagementService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService
    ) {}

    ngOnInit(): void {
        this.loadDropdown();
    }
    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.activeFlagList = [
                { value: true, nameTh: this.translate.instant('common.status.active') },
                { value: false, nameTh: this.translate.instant('common.status.inActive') },
                { value: null, nameTh: this.translate.instant('common.status.all') }
            ];
        }

        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchData();
        }

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

        if (this.tabIndex === 1) {
            /** ผู้สมัคร */
            this.criteria.refUserType = 30032002;
        } else {
            /** บุคลากรภายใน */
            this.criteria.refUserType = null;
        }

        this.userManagementService.findUser(this.criteria).subscribe(({ status, message, entries, totalRecords }) => {
            this.loaderService.stop();
            this.initForm = true;
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

    onChange(event?: TabViewChangeEvent) {
        this.tabIndex = event.index;
        this.fetchData();
    }

    onClear() {
        this.criteria = {
            username: null,
            email: null,
            firstnameTh: null,
            telephone: null,
            roleIds: null,
            activeFlag: null,
            /** บุคลากรภายใน */
            refUserType: null,
            isLocal: false
        };
        this.fetchData();
    }
    openPage(page: MODE_PAGE, id?: number) {
        this.editData = {
            accessLevel: null,
            activeFlag: true,
            activePeriodEnd: null,
            activePeriodStart: null,
            activePeriodStatus: false,
            depCode: null,
            depIdLevel1: null,
            depIdLevel2: null,
            depNameAbbrEn: null,
            depNameAbbrTh: null,
            depNameEn: null,
            depNameShortEn: null,
            depNameShortTh: null,
            depNameTh: null,
            email: null,
            first: null,
            firstnameEn: null,
            firstnameTh: null,
            isLocal: true,
            lastChangepasswdDatetime: null,
            lastLoginDatetime: null,
            lastLogoutDatetime: null,
            lastnameEn: null,
            lastnameTh: null,
            mode: null,
            password: null,
            refUserId: null,
            refUserType: null,
            roleId: null,
            roleIds: [],
            rowNum: null,
            size: null,
            telephone: null,
            userId: null,
            username: null,
            filename: null,
            prefix: null,
            module: null,
            userSignaturePath: null
        };
        if (page == 'CREATE') {
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
            // this.fetchData();
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.userManagementService.getUser(id).subscribe((result) => {
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
        }
    }
    onExport() {}

    loadDropdown() {
        this.dropdownService.getRoleDropdown({}).subscribe(({ status, message, entries }) => {
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

        this.activeFlagList = [
            { value: true, nameTh: this.translate.instant('common.status.active') },
            { value: false, nameTh: this.translate.instant('common.status.inActive') },
            { value: null, nameTh: this.translate.instant('common.status.all') }
        ];
    }
}
