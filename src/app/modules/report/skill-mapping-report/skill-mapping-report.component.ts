import { Component, DoCheck, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { CourseMainData, CourseOccupationData } from 'src/app/models/course-management';
import { MasGeneralSkillData, MasOccupationData } from 'src/app/models/master';
import { DropdownService } from 'src/app/services/dropdown.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
    selector: 'app-skill-mapping-report',
    templateUrl: './skill-mapping-report.component.html',
    styleUrls: ['./skill-mapping-report.component.scss']
})
export class SkillMappingReportComponent implements OnInit, DoCheck {

    initForm: boolean = false;
    lang: string;

    mode: MODE_PAGE = 'LIST';

    items: MasOccupationData[] = [];
    itemsSkill: MasGeneralSkillData[] = [];
    itemCourse:CourseMainData[]=[];

    totalRecords: number = 0;
    rows: number = 5;

    aspectList: DropdownData[] = [];
    jobList:DropdownData[] = [];

    occupationList: DropdownData[] = [];

    criteria: any = {
        aspectSelected: null,
        jobSelected: null,
        skillSelected: null,
        courseSelected: null,
        first: 0,
        size: 5,
        mode: 'search'
    }

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private reportService: ReportService
    ) {
    }

    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.onSearch();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit(): void {
        this.loadDropDown();
        this.lazyLoadOccupation();
    }

    loadDropDown() {
        this.aspectList = [
            {value:1,nameTh:'อาชีพ',nameEn:'Occupation'},
            {value:2,nameTh:'ทักษะ',nameEn:'Skill'},
            {value:3,nameTh:'คอร์ส',nameEn:'Course'}
        ];
    }
    getUniqueListBy(arr: any[], key) {
        return [...new Map(arr.map((item) => [item[key], item])).values()];
    }

    lazyLoadOccupation(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: false
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (this.criteria.jobSelected) {
            dropdownCriteriaData.pkId = this.criteria.jobSelected;
        }

        this.dropdownService.getOccupationCustomLanguageDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.occupationList = this.getUniqueListBy([...this.occupationList, ...entries], 'value');
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

    onClear() {
        this.criteria = {
            aspectSelected: null,
            jobSelected: null,
            first: 0,
            size: 5,
            mode: 'search'
        };
        this.onSearch();
    }

    backToFirstPage() {
        let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
        pageFirst?.click();
    }

    onSearch(event?: TablePageEvent) {
        console.log(">>>>criteria.aspectSelected::",this.criteria.aspectSelected);

        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
            if (event.rows !== this.rows) {
                this.backToFirstPage();
            }
        } else {
            this.backToFirstPage();
        }
        if(this.criteria.aspectSelected==1){
            this.loaderService.start();
            console.log("this.criteria:",this.criteria);
            this.reportService.findOccupationData(this.criteria).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    console.log("result.entries::",result.entries);
                    this.items = result.entries;
                    for(let i=0;i<this.items.length;i++){
                        this.jobList.push({value:this.items[i].occupationId,nameTh:this.items[i].occupationNameTh,nameEn:this.items[i].occupationNameEn})
                    }
                    console.log("this.jobList::",this.jobList)
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
        }else if(this.criteria.aspectSelected==2){
            this.loaderService.start();
            console.log("this.criteria:",this.criteria);
            this.reportService.findSkillData(this.criteria).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    console.log("result.entries::",result.entries);
                    this.itemsSkill = result.entries;
                    console.log("this.jobList::",this.jobList)
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
        }else if(this.criteria.aspectSelected==3){
            this.loaderService.start();
            console.log("this.criteria:",this.criteria);
            this.reportService.findCourseData(this.criteria).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    console.log("result.entries::",result.entries);
                    this.itemCourse = result.entries;
                    console.log("this.jobList::",this.jobList)
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

    }

    onExport() {

        if (this.criteria.aspectSelected==1) {
            this.loaderService.start();
            this.criteria.mode = 'excelbase64';

            this.reportService.findOccupationData(this.criteria).subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    console.log('export')

                    var link = document.createElement("a");
                    document.body.appendChild(link);
                    link.setAttribute("type", "hidden");
                    link.href = "data:application/octet-stream;charset=utf-8;base64," + entries;
                    //console.log('entries :>> ', entries);
                    link.download = `รายงาน Skill Mapping-มุมมองอาชีพ-${new Date().toJSON().slice(0, 10).replace(/-/g, '')}.xlsx`;
                    link.click();
                    document.body.removeChild(link);

                }
                else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    })
                }
            })
        } else if (this.criteria.aspectSelected==2) {
            this.loaderService.start();
            this.criteria.mode = 'excelbase64';

            this.reportService.findSkillData(this.criteria).subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    console.log('export')

                    var link = document.createElement("a");
                    document.body.appendChild(link);
                    link.setAttribute("type", "hidden");
                    link.href = "data:application/octet-stream;charset=utf-8;base64," + entries;
                    //console.log('entries :>> ', entries);
                    link.download = `รายงาน Skill Mapping-มุมมองทักษะ-${new Date().toJSON().slice(0, 10).replace(/-/g, '')}.xlsx`;
                    link.click();
                    document.body.removeChild(link);

                }
                else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    })
                }
            })
        } else if (this.criteria.aspectSelected==3) {
            this.loaderService.start();
            this.criteria.mode = 'excelbase64';

            this.reportService.findCourseData(this.criteria).subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    console.log('export')

                    var link = document.createElement("a");
                    document.body.appendChild(link);
                    link.setAttribute("type", "hidden");
                    link.href = "data:application/octet-stream;charset=utf-8;base64," + entries;
                    //console.log('entries :>> ', entries);
                    link.download = `รายงาน Skill Mapping-มุมมองคอร์ส-${new Date().toJSON().slice(0, 10).replace(/-/g, '')}.xlsx`;
                    link.click();
                    document.body.removeChild(link);

                }
                else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    })
                }
            })
        } else {
            return ;
        }
        this.onClear();

    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success'
            || event.message.severity === 'warn'
            || event.message.severity === 'error'
        ) {
        }
    }
}
