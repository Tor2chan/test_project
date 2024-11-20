import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NewsManagementService } from 'src/app/services/news-management.service';
import { DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { DropdownService } from 'src/app/services/dropdown.service';
import { TablePageEvent } from 'primeng/table';
import { NewsInfoData } from 'src/app/models/news-management/NewsInfoData';
import { NewsInfoAttachData } from 'src/app/models/news-management/NewsInfoAttachData';

@Component({
    selector: 'app-news-management-list',
    templateUrl: './news-management-list.component.html',
    styleUrls: ['./news-management-list.component.scss']
})
export class NewsManagementListComponent implements DoCheck, OnInit {
    // buttonitems:any[]=[{value:0,label:'ประชาสัมพันธ์ทั่วไป',type:'general',command: () => {this.openPage("CREATE",30019001)}},{value:1,label:'ประชาสัมพันธ์หลักสูตร',type:'course',command: () => {this.openPage("CREATE",30019002)}}]
    initForm: boolean = false;
    mode: MODE_PAGE = 'LIST';
    lang: string;

    items: NewsInfoData[] = [];
    newsFormatList: DropdownData[] = [];
    totalRecords: number = 0;
    editData: NewsInfoData;
    editDataAttach: NewsInfoAttachData;
    itemm: NewsInfoAttachData[] = [];

    clickNewsStart: boolean = false;
    clickNewsEnd: boolean = false;

    criteria: NewsInfoData = {
        newsHeading: null,
        newsDetail: null,
        newsFormat: null,
        newsStart: null,
        newsEnd: null,
        createdByName: null,
        newsStatus: null,
        mode: 'search'
    };

    activeFlagList: DropdownData[];
    statusList: DropdownData[];

    constructor(
        public translate: TranslateService,
        private newsManagementService: NewsManagementService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.getDropdownNewFormat();
    }
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
            this.statusList = [
                { value: true, nameTh: this.translate.instant('common.status.active') },
                { value: false, nameTh: this.translate.instant('common.status.inActive') },
                { value: null, nameTh: this.translate.instant('common.status.all') }
            ];
            this.clickNewsStart = false;
            this.clickNewsEnd = false;
        }
    }

    onSearch(event?: TablePageEvent) {
        this.loaderService.start();
        this.loaderService.stop();

        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
        }

        this.newsManagementService.findNewsInfo(this.criteria).subscribe((result) => {
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

    onClear() {
        this.criteria = {
            newsHeading: null,
            newsDetail: null,
            newsFormat: null,
            newsStart: null,
            newsEnd: null,
            createdByName: null,
            newsStatus: null
        };
        this.onSearch();
    }

    getDropdownNewFormat() {
        this.dropdownService
            .getLookup({ displayCode: false, id: LOOKUP_CATALOG.NEWS_FORMAT })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.newsFormatList = entries;
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
        if (page === 'CREATE') {
            this.editData = {
                newsHilight: null,
                newsDetail: '',
                newsCoverimage: '',
                filename: '',
                prefix: '',
                module: null,
                activeFlag: true
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.newsManagementService.getNewsInfoRefMode(id).subscribe((result) => {
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
            this.loaderService.start();
            this.newsManagementService.getNewsInfoRefMode(id).subscribe((result) => {
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

    // fetchTable(event?: TablePageEvent) {
    //     this.onSearch();
    //     this.loaderService.start();
    //     this.editDataAttach = {
    //         newsId: this.editData.newsId,
    //         activeFlag: true,
    //         first: 0,
    //         size: 5
    //     };

    //     if (event) {
    //         this.criteria.size = event.rows;
    //         this.criteria.first = event.first;
    //     }

    //     if (this.criteria.newsId) {
    //         this.newsManagementService
    //             .findNewsInfoAttachRefMode(this.criteria) // รอ
    //             .subscribe(({ status, message, entries, totalRecords }) => {
    //                 this.loaderService.stop();
    //                 if (status === 200) {
    //                     this.itemm = entries;
    //                     this.totalRecords = totalRecords;
    //                 } else {
    //                     this.messageService.add({
    //                         severity: 'error',
    //                         summary: this.translate.instant('common.alert.fail'),
    //                         detail: this.translate.instant(message),
    //                         life: 2000
    //                     });
    //                 }
    //             });
    //     } else {
    //         this.loaderService.stop();
    //     }
    // }

    deleteNewsInfo(event: Event, item?: any) {
        this.confirmationService.confirm({
            key: 'confirm1',
            target: event.target || new EventTarget(),
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: this.translate.instant('newsManagement.acceptLabel'),
            rejectLabel: this.translate.instant('newsManagement.rejectLabel'),
            accept: () => {
                this.newsManagementService.deleteNewsInfo(item).subscribe((result) => {
                    if (result.status == 200) {
                        this.messageService.add({ severity: 'success', summary: this.translate.instant('newsManagement.toastAccept'), detail: this.translate.instant('newsManagement.toastAcceptMessage'), life: 3000 });
                        this.onSearch();
                        console.log('result.entries1::', result.entries);
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(result.message),
                            life: 2000
                        });
                    }
                });
            },
            reject: () => {
                console.log('>>>>no<<<<');
                this.messageService.add({ severity: 'error', summary: this.translate.instant('newsManagement.toastReject'), detail: this.translate.instant('newsManagement.toastRejectMessage'), life: 3000 });
            }
        });
    }

    // deleteNewsInfo(event: Event, item?: any) {
    //     this.confirmationService.confirm({
    //         key: 'confirm1',
    //         target: event.target || new EventTarget(),
    //         icon: 'pi pi-exclamation-triangle',
    //         accept: () => {
    //             this.newsManagementService.deleteNewsInfoAttach(item).subscribe((result) => {
    //                 if (result.status == 200) {
    //                     this.fetchTable();
    //                     console.log('result.entries1::', result.entries);
    //                     this.newsManagementService.deleteNewsInfo(item).subscribe((result) => {
    //                         if (result.status == 200) {
    //                             console.log('result.entries2::', result.entries);
    //                             this.onSearch();
    //                         } else {
    //                             this.messageService.add({
    //                                 severity: 'error',
    //                                 summary: this.translate.instant('common.alert.fail'),
    //                                 detail: this.translate.instant(result.message),
    //                                 life: 2000
    //                             });
    //                         }
    //                     });
    //                 }else if (result.status == 200){

    //                 }
    //             });
    //         },
    //         reject: () => {
    //             console.log('>>>>no<<<<');
    //             this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
    //         }
    //     });
    // }

    deleteNewsInfo2(event: Event, item?: any) {
        this.confirmationService.confirm({
            key: 'confirm1',
            target: event.target || new EventTarget(),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.newsManagementService.deleteNewsInfo(item).subscribe((result) => {
                    if (result.status == 200) {
                        console.log('result.entries::', result.entries);
                        this.onSearch();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(result.message),
                            life: 2000
                        });
                    }
                });
            },
            reject: () => {
                console.log('>>>>no<<<<');
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            }
        });
    }
}
