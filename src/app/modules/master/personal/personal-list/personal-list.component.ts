import { DropdownService } from 'src/app/services/dropdown.service';
import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { MasPersonalData } from 'src/app/models/master';
import { MasterService } from 'src/app/services/master.service';
import { DropdownFilterEvent } from 'primeng/dropdown';

@Component({
    selector: 'app-personal-list',
    templateUrl: './personal-list.component.html',
    styleUrls: ['./personal-list.component.scss']
})
export class PersonalListComponent implements DoCheck {
    visible: boolean = false;

    initForm: boolean = false;
    lang: string;

    progress: number = 0;

    mode: MODE_PAGE = 'LIST';

    criteria: MasPersonalData = {
        buasriId: null,
        fullname: null,
        positionTh: null,
        email: null,
        statusNameTh: null,
        first: 0,
        size: 5
    };
    items: MasPersonalData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: MasPersonalData;

    activeFlagList: DropdownData[];

    personalTypeList: DropdownData[] = [];
    departmentList: DropdownData[] = [];

    viewData: MasPersonalData = {};

    syncDate: Date;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService
    ) {}
    ngOnInit(): void {
        this.loadDropDown();
        this.lazyLoadDepartment();
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                id: LOOKUP_CATALOG.STAFF_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.personalTypeList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });

        /*
        this.dropdownService.getDepartmentDropdown({}).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentList = entries;
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: message,
                    life: 2000
                });
            }
        });
        */
    }

    ngDoCheck() {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onClear();
            this.onCheckProgress();
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

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    onSearch(event?: TablePageEvent) {
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

        this.masterService.findPersonal(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
                this.syncDate = result.syncDate;
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(result.message),
                    life: 2000
                });
            }
        });
    }

    onClear() {
        this.criteria = {
            buasriId: null,
            fullname: null,
            positionTh: null,
            email: null,
            statusNameTh: null,
            first: 0,
            size: 5
        };
        this.onSearch();
    }

    openDialog(data: MasPersonalData): void {
        this.visible = true;
        this.viewData = data;
    }

    onRepull() {
        this.progress = 0;
        this.masterService.getPersonalPull()
        .subscribe(({ status, message }) => {
            if (status === 200) {
                this.onCheckProgress()
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(message),
                    life: 2000
                });
            }
        })

    }

    onCheckProgress() {

        this.masterService.getPersonalCheck()
        .subscribe(({ status, message, entries }) => {
            if (status === 200) {
                const { progress } = entries
                this.progress = progress;
                setTimeout(() => {
                    if (this.progress < 100) {
                        this.onCheckProgress();
                    }
                }, 2000);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(message),
                    life: 2000
                });
            }
        })

    }

    lazyLoadDepartment(event?: DropdownFilterEvent, id?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009001,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentList = entries;
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
