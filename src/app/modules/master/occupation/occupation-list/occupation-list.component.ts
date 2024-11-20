import { DropdownCriteriaData, DropdownData } from '../../../../models/common/common';
import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TablePageEvent } from 'primeng/table';
import { MODE_PAGE } from 'src/app/models/common';
import { MasOccupationData } from 'src/app/models/master';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-occupation-list',
    templateUrl: './occupation-list.component.html',
    styleUrls: ['./occupation-list.component.scss']
})
export class OccupationListComponent implements DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    criteria: MasOccupationData = {
        occupationCode: null,
        occupationGroupId: null,
        occupationNameEn: null,
        occupationNameTh: null,
        activeFlag: null
    };
    items: MasOccupationData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: MasOccupationData;

    activeFlagList: DropdownData[];
    occupationGroupList: DropdownData[] = [];

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService
    ) {
        this.initForm = true;
        this.lazyLoadOccupationGroup(null);
        this.onSearch();
    }

    lazyLoadOccupationGroup(event: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService
            .getOccupationGroupDropdown(dropdownCriteriaData)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.occupationGroupList = entries;
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

        this.masterService.findOccupation(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
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

    openPage(page: MODE_PAGE, id?: number) {
            this.editData = {
                occupationId: null,
                occupationCode: null,
                occupationGroupId: null,
                occupationNameEn: null,
                occupationNameTh: null,
                activeFlag: true
            };
        if (page == 'CREATE') {
            this.mode = page;
            console.log('this.mode (click LV1 create) :>> ', this.mode);
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.masterService.getOccupation(id).subscribe((result) => {
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
            occupationCode: null,
            occupationGroupId: null,
            occupationNameEn: null,
            occupationNameTh: null,
            activeFlag: null
        };
        this.onSearch();
    }
}
