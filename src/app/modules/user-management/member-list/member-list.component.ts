import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { MemberInfoData } from 'src/app/models/user-management';
import { DropdownService } from 'src/app/services/dropdown.service';
import { UserManagementService } from 'src/app/services/user-management.service';

@Component({
    selector: 'app-member-list',
    templateUrl: './member-list.component.html',
    styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent implements OnInit, DoCheck {
    initForm: boolean = false;

    lang: string;

    mode: MODE_PAGE = 'LIST';

    currDate: Date = new Date();

    criteria: MemberInfoData = {
        memberNo: null,
        memberCardno: null,
        memberFirstnameTh: null,
        memberEmail: null,
        memberPhoneno: null,
        filename: null,
        lastLoginDatetime: null,
        prefix: null,
        module: null,
        first: 0,
        rowNum: 5
    };

    imgSrcFacebook: string = 'assets/layout/images/dummy/FacebookIcon.svg';
    imgSrcSWU: string = 'assets/layout/images/dummy/SWU Life Long.svg';
    imgSrcGoogle: string = 'assets/layout/images/dummy/GoogleIcon.svg.svg';
    imgSrcImport: string = 'assets/layout/images/dummy/import.svg';
    iconStyle: any = {
        'width': '1px',
        'height': '1px',
        'max-width': '1px',
        'max-height': '1px',
      };
    editData: MemberInfoData;

    items: MemberInfoData[] = [];
    totalRecords: number = 0;
    chFormatLits: any[] = [];
    rows: number = 5;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private userManagementService: UserManagementService
    ) {}

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchData();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit(): void {
        this.getDropdownChFormat();
        console.log('>>> ',this.chFormatLits);
    }

    getDropdownChFormat() {
        this.dropdownService
            .getLookup({ displayCode: false, id: LOOKUP_CATALOG.ACCOUNT_FORMAT })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.chFormatLits = entries;
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
            .findMemberInfo(this.criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
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
            // this.dropdownService
            // .getLookup({ displayCode: false, id: LOOKUP_CATALOG.ACCOUNT_FORMAT })
            // .subscribe(({ status, message, entries }) => {
            //     if (status === 200) {
            //         this.chFormatLits = entries;
            //     } else {
            //         this.messageService.add({
            //             severity: 'error',
            //             summary: this.translate.instant('common.alert.fail'),
            //             detail: this.translate.instant(message),
            //             life: 2000
            //         });
            //     }
            // });
    }

    onClear() {
        this.criteria = {
            memberCardno: null,
            memberFirstnameTh: null,
            memberEmail: null,
            memberPhoneno: null,
            filename: null,
            prefix: null,
            module: null,
            first: 0,
            rowNum: 5
        };
        this.fetchData();

    }

    openPage(page: MODE_PAGE, id?: number) {
        if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.userManagementService.getMemberInfo(id).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    console.log("200 >> ", id);

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
                console.log("else >> ", id);
            });
        }
    }
}
