import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { MasConsentManageData } from 'src/app/models/master';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-consent-management-list',
    templateUrl: './consent-management-list.component.html',
    styleUrls: ['./consent-management-list.component.scss']
})
export class ConsentManagementListComponent implements DoCheck, OnInit {

    initForm: boolean = false;
    lang: string;
    mode: MODE_PAGE = 'LIST';
    clickYear: boolean = false;

    criteria: MasConsentManageData = {
        formType: null,
        formName: null,
        formNameTh: null,
        formNameEn: null,
        versionNo: null,
        formDetail: null,
        formDetailTh: null,
        formDetailEn: null,
        formNote: null,
        acceptButton: null,
        consentStatus: true,
        requestDateStart: null,
        requestDateEnd: null,
        mode: 'search'
    };
    items: MasConsentManageData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: MasConsentManageData;

    activeFlagList: DropdownData[];

    typeList: DropdownData[];

    approveDate: Date;

    clickYearStart: boolean = false;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService
    ) {
    }
    ngOnInit(): void {

    }

    ngDoCheck() {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onClear();
            this.onSearch();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.activeFlagList = [
                { value: true, nameTh: this.translate.instant('common.status.active') },
                { value: false, nameTh: this.translate.instant('common.status.inActive') },
                { value: null, nameTh: this.translate.instant('common.status.all') }
            ];
            this.typeList = [
                { value: 30018001, nameTh: "สมัครสมาชิก" },
                { value: 30018003, nameTh: "ออกใบรับรอง" },
                { value: 30018003, nameTh: "อื่นๆ" }
            ];
        }
    }

    getDropdown() {
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

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    onSearch(event?: TablePageEvent) {
        this.loaderService.start();
        this.loaderService.stop();

        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
            if (event.rows !== this.rows) {
                this.backToFirstPage();
            }
        } else {
            this.backToFirstPage();
        }

        this.masterService
        .findConsentManagement(this.criteria)
        .subscribe(result => {
                this.loaderService.stop()
                if (result.status === 200) {
                    this.items = result.entries;
                    this.totalRecords = result.totalRecords;

                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant(result.message),
                        life: 2000
                    });
                }
            })
    }

    openPage(page: MODE_PAGE, id?: number) {
        if (page == 'CREATE') {
            this.editData = {
                formType: '',
                formName: '',
                formNameTh: '',
                formNameEn: '',
                versionNo: '',
                formDetail: '',
                formDetailTh: '',
                formDetailEn: '',
                formNote: '',
                acceptButton: '',
                consentStatus: true,
                activeFlag: true
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.masterService.getMasConsentManage(id).subscribe((result) => {
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
        } else if (page == 'VIEW') {
            console.log(11)
            this.loaderService.start();
            this.masterService.getMasConsentManage(id).subscribe((result) => {
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

    onClear() {
        this.criteria = {
            formNameTh: null,
            formNameEn: null,
            fullNameTh: null,
            updateDate: null,
            activeFlag: null,
            requestDateStart: null,
            requestDateEnd: null,
        };
        this.onSearch();
    }
}
