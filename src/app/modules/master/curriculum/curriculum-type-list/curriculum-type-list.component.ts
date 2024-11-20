import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownData, MODE_PAGE } from 'src/app/models/common';
import { SwuCerriculum } from 'src/app/models/master/swuCerriculum';
import { MasterService } from 'src/app/services/master.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasDepartmentData } from 'src/app/models/master/masDepartmentData';
@Component({
    selector: 'app-curriculum-type-list',
    templateUrl: './curriculum-type-list.component.html',
    styleUrls: ['./curriculum-type-list.component.scss']
})
export class CurriculumTypeListComponent implements DoCheck {
    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';
    progress: number = 0;
    criteria: SwuCerriculum = {};
    items: SwuCerriculum[] = [];
    totalRecords: number = 0;
    rows: number = 5;
    syncDate: Date;
    editData: SwuCerriculum;

    courseMappingStatusList: DropdownData[];
    studyYearList: DropdownData[];
    eduLevelCodeList: DropdownData[];
    depList:MasDepartmentData[] = [];;
    facultyList:MasDepartmentData[] = [];;
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
            this.eduLevelCodeList = [
                { value: null, nameTh: this.translate.instant('common.status.all') },
                { value: 7, nameTh: this.translate.instant('master.curriculum.table.dropdown.masterDegree') },
                { value: 6, nameTh: this.translate.instant('master.curriculum.table.dropdown.graduateCertificate') },
                { value: 5, nameTh: this.translate.instant('master.curriculum.table.dropdown.bachelorDegree') },
                { value: 8, nameTh: this.translate.instant('master.curriculum.table.dropdown.doctoralDegree') }
            ];
            this.courseMappingStatusList = [
                { value: true, nameTh: this.translate.instant('master.courseType.criteria.compareMapping') },
                { value: false, nameTh: this.translate.instant('master.courseType.criteria.uncompareMapping') },
                { value: null, nameTh: this.translate.instant('common.status.all') }
            ];
            this.studyYearList =[
                { value: null, nameTh: this.translate.instant('common.status.all') },
                { value: 1, nameTh: "1" ,nameEn: "1"},
                { value: 2, nameTh: "2" ,nameEn: "2"},
                { value: 3, nameTh: "3" ,nameEn: "3"},
                { value: 4, nameTh: "4" ,nameEn: "4"},
                { value: 5, nameTh: "5" ,nameEn: "5"},
                { value: 6, nameTh: "6" ,nameEn: "6"},
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

        this.masterService.findCurriculum(this.criteria).subscribe((result) => {
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
            creditStudy: null,
            degreeCode: null,
            majorCode: null,
            eduLevelCode: null,
            studyYear: null,
            depId: null,
            faculty: null
        };
        this.onSearch();
    }

    onRepull(event?: TablePageEvent) {
        this.progress = 0;
        this.masterService.getCurriculumlPull()
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

        this.masterService.getCurriculumCheck()
        .subscribe(({ status, message, entries }) => {
            if (status === 200) {
                const { progress } = entries
                this.progress = progress;
                setTimeout(() => {
                    console.log("process>",this.progress);
                    if (this.progress < 100) {
                        this.onCheckProgress();
                    }
                }, 1000);
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
            .getDepartmentType(30009001)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.depList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });

            this.masterService
            .getDepartmentType(30009002)
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


