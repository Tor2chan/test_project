import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { CreatorListData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { MasWebsiteBannerData } from 'src/app/models/master/masWebsiteBannerData';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-website-banner-list',
    templateUrl: './website-banner-list.component.html',
    styleUrls: ['./website-banner-list.component.scss']
})
export class WebsiteBannerListComponent implements DoCheck, OnInit {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';
    imgSrc: string = 'assets/layout/images/dummy/n-a.svg';

    showUpload: boolean = true;

    criteria: MasWebsiteBannerData = {
        lastUpDateList: null,
        fullNameTh: null,
        bannerName: null,
        base64: null,
        mode: 'search'
    };
    items: MasWebsiteBannerData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: MasWebsiteBannerData;

    activeFlagList: DropdownData[];
    creatorList: CreatorListData[] = [];
    clickYear: boolean = false;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private confirmationService: ConfirmationService
    ) {
    }
    ngOnInit(): void {
        this.loadDropDown();
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
            this.creatorList = [
                { fullNameTh: null, value: this.translate.instant('common.pleaseSelect') }
            ];
            this.clickYear = false;
        }

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
        .findWebsiteBanner(this.criteria)
        .subscribe(({ status, message, entries, totalRecords }) => {
            this.loaderService.stop();
            if (status === 200) {
                this.items = (entries || []).map((o) => {
                    if (o.base64) {
                        const extension = o.filename.split('.')[1];
                        const image = `data:image/${extension};base64,${o.base64}`;
                        return {
                            ...o,
                            base64: image
                        };
                    } else {
                        return o;
                    }
                });
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

    openPage(page: MODE_PAGE, id?: number) {
        if (page == 'CREATE') {
            this.editData = {
                bannerName: '',
                bannerLink: '',
                bannerImageTh: '',
                bannerImageEn: '',
                orderBy: null,
                activeFlag: true,
                filename: '',
                prefix: '',
                module: null
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.masterService.getWebsiteBanner(id).subscribe((result) => {
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

    loadDropDown() {
        this.masterService
            .findWebsiteBanner(this.criteria)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.creatorList = entries;
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
        this.criteria = {
            lastUpDateList: null,
            fullNameTh: null,
            bannerName: null
        };
        this.onSearch();
    }

    deleteBanner(id: number) {
        this.confirmationService.confirm({
            key: 'confirm1',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                this.masterService.deleteWebsiteBanner(id).subscribe(({ status, message }) => {
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
