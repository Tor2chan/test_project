import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownData, MODE_PAGE } from 'src/app/models/common';
import { SwuCerriculum } from 'src/app/models/master/swuCerriculum';
import { SwuSubject } from 'src/app/models/master/swuSubject';
import { MasterService } from 'src/app/services/master.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasDepartmentData } from 'src/app/models/master/masDepartmentData';
@Component({
    selector: 'app-subject-type-list',
    templateUrl: './subject-type-list.component.html',
    styleUrls: ['./subject-type-list.component.scss']
})
export class SubjectTypeListComponent implements DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';
    progress: number = 0;
    criteria: SwuSubject = {};
    criteriaDropDown: SwuCerriculum = {};
    items: SwuSubject[] = [];
    totalRecords: number = 0;
    rows: number = 5;
    syncDate: Date;
    editData: SwuSubject;

    courseMappingStatusList: DropdownData[];
    studyYearList: DropdownData[];
    eduLevelCodeList: DropdownData[];
    depList:MasDepartmentData[] = [];;
    facultyList:SwuCerriculum[] = [];;
    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService
    ) {
        this.loadDropDown();
    }

    ngDoCheck() {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onClear();
            this.onCheckProgress();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
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

        this.masterService.findSubject(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
                this.syncDate = result.entries[0].updateDate;
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
            curriculumSwuId: null,
            curriculumMhesiId: null,
            groupName: null,
            minorType: null,
            subjectCode: null,
            subjectName: null,
            subjectCredit: null,
            subjectType: null
        };
        this.onSearch();
    }

    onRepull(event?: TablePageEvent) {
        this.progress = 0;
        this.masterService.getSubjectlPull()
        .subscribe(({ status, message }) => {
            if (status === 200) {
                this.onCheckProgress();
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

        this.masterService.getSubjectCheck()
        .subscribe(({ status, message, entries }) => {
            if (status === 200) {
                const { progress } = entries
                this.progress = progress;
                setTimeout(() => {
                    console.log("process>",this.progress);
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


    loadDropDown() {
            
            this.masterService
            .findCurriculumAll(this.criteriaDropDown)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.facultyList = entries;
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


