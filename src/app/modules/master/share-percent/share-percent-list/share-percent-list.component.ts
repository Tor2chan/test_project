import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MODE_PAGE, DropdownData, DropdownCriteriaData } from 'src/app/models/common';
import { MasterService } from '../../../../services/master.service';
import { MasDepartmentData, MasSharePercentData } from 'src/app/models/master';
import { TablePageEvent } from 'primeng/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownService } from 'src/app/services/dropdown.service';
import { DropdownFilterEvent } from 'primeng/dropdown'
@Component({
    selector: 'app-share-percent-list',
    templateUrl: './share-percent-list.component.html',
    styleUrls: ['./share-percent-list.component.scss']
})
export class SharePercentListComponent implements DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    criteria: MasSharePercentData = {
        depId: null
    };
    criterias: MasDepartmentData = {
        depId: null,
        depNameTh: null,
        depNameEn: null
    };
    items: MasSharePercentData[] = [];
    selectItem: MasSharePercentData;
    totalRecords: number = 0;
    rows: number = 5;
    departmentLookupList: any = [];
    editData: MasSharePercentData;

    activeFlagList: DropdownData[];

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService
    ) {
        this.lazyLoadDep(null);
    }

    ngDoCheck() {
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
    getDepartmentLookup() {
        this.masterService.findDepartment(this.criterias).subscribe((result) => {
            console.log('result:departmrnt:', result);
            this.departmentLookupList = result.entries;
        });
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

        this.masterService.findSharePercent(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                console.log('result.entries:', result.entries);
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
        });
    }

    openPage(page: MODE_PAGE, items?: MasSharePercentData, id?: number) {
        if (page == 'CREATE') {
            console.log('items:', items);
            this.mode = page;
            this.selectItem = items;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        }
    }

    onClear() {
        this.criteria = {
            depId: null
        };
        this.onSearch();
    }

    lazyLoadDep(event: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentLookupList = entries;
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
