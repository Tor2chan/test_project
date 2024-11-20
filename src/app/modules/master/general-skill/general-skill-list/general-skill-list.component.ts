
import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MODE_PAGE, DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { MasterService } from '../../../../services/master.service';
import { MasGeneralSkillData } from 'src/app/models/master';
import { TablePageEvent } from 'primeng/table';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownService } from 'src/app/services/dropdown.service';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { PreviewFileService } from 'src/app/services/preview-file.service';

@Component({
    selector: 'app-general-skill-list',
    templateUrl: './general-skill-list.component.html',
    styleUrls: ['./general-skill-list.component.scss']
})
export class GeneralSkillListComponent implements DoCheck,OnInit{
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    criteria: MasGeneralSkillData = {
        skillFormat: null,
        generalSkillNameEn: null,
        generalSkillNameTh: null
    };
    items: MasGeneralSkillData[] = [];
    totalRecords: number = 0;
    rows: number = 5;

    editData: MasGeneralSkillData;

    activeFlagList: DropdownData[];
    categorySkillList: DropdownData[] = [];


    imgSrc: string = 'assets/layout/images/dummy/dummy.svg';

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private previewFileSerivce: PreviewFileService,
        private loaderService: NgxUiLoaderService
    ) {}
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
            this.categorySkillList = [
                { value: null, nameTh: this.translate.instant('common.pleaseSelect') }
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

        this.masterService
        .findGeneralSkill(this.criteria)
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
                filename: '',
                prefix: '',
                module: null,
                skillFormat: '',
                generalSkillNameEn: '',
                generalSkillNameTh: '',
                activeFlag: true
            };
            this.mode = page;
        } else if (page == 'LIST') {
            this.mode = page;
            this.items = [];
            this.initForm = false;
        } else if (page == 'EDIT') {
            this.loaderService.start();
            this.masterService.getGeneralSkill(id).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.editData = result.entries;
                    this.mode = page;
                    console.log(this.editData);
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
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.SKILLS_CATEGORIES_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.categorySkillList = entries;
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
            generalSkillNameEn: null,
            generalSkillNameTh: null,
            generalSkillCode: null,
            activeFlag: null
        };
        this.onSearch();
    }
}
