import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownData, MODE_PAGE } from 'src/app/models/common';
import { MasDepartmentData } from 'src/app/models/master';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-faculty-list',
    templateUrl: './faculty-list.component.html',
    styleUrls: ['./faculty-list.component.scss']
})
export class FacultyListComponent implements DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    criteria: MasDepartmentData = {
        depCode: null,
        depNameTh: null,
        depNameEn: null
    };

    items: MasDepartmentData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: MasDepartmentData;

    activeFlagList: DropdownData[];

    educationStatusList: DropdownData[];

    progress: number = 0;
    syncDate: Date;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService
    ) {
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
            this.educationStatusList = [
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

        this.masterService.findDepartment(this.criteria).subscribe((result) => {
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

    openPage(page: MODE_PAGE) {
        if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        }
    }

    onClear() {
        this.criteria = {
            depCode: null,
            depNameTh: null,
            depNameEn: null,
            educationStatus: null
        };
        this.onSearch();
    }

    onRepull() {
        this.progress = 0;
        this.masterService.getDepartmentPull()
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

        this.masterService.getDepartmentCheck()
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

}
