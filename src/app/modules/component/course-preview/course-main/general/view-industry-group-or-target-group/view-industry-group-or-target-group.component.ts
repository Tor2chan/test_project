import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CourseMainData, CourseOccupationData, CourseTargetData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
  selector: 'app-view-industry-group-or-target-group',
  templateUrl: './view-industry-group-or-target-group.component.html',
  styleUrls: ['./view-industry-group-or-target-group.component.scss']
})
export class ViewIndustryGroupOrTargetGroupComponent implements OnInit {


    @Input() lang: string;
    @Input() courseMain: CourseMainData;

    industryGroupList: DropdownData[] = [];
    targetGroupList: DropdownData[] = [];
    occupationList: DropdownData[] = [];
    courseTargetTemp: number[] = [];
    courseTargetList: CourseTargetData[] = [];
    courseOccupationTemp: number[] = [];
    courseOccupationList: CourseOccupationData[] = [];

    initForm: boolean = false;

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // this.fetchData();
        this.loadDropDown();
        setTimeout(() => {
            this.lazyLoadOccupation(null, this.courseOccupationTemp);
            this.loadFkTable(this.courseMain.courseId);
        }, 150);
        this.initForm = true;
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.INDUSTRY_GROUP
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.industryGroupList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });

        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.TARGET_GROUP
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.targetGroupList = entries;
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

    lazyLoadOccupation(event: DropdownFilterEvent, pkIds?: number[]) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if ((pkIds || []).length > 0) {
            dropdownCriteriaData.pkIds = pkIds;
        }

        this.dropdownService.getOccupationDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.occupationList = entries;
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

    loadFkTable(courseId?: number) {
        this.courseManagementService.getCourseTargetCourse(courseId).subscribe(({ status, entries }) => {
            if (status === 200) {
                this.courseTargetTemp = entries.map(({ targetGroupId }) => {
                    return targetGroupId;
                });
            }
        });

        this.courseManagementService.getCourseOccupationCourse(courseId).subscribe(({ status, entries }) => {
            if (status === 200) {
                this.courseOccupationTemp = entries.map(({ occupationId }) => {
                    return occupationId;
                });
            }
        });
    }

    /*
    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: any = {
            courseId: this.courseMain.courseId,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseRequestAttach(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.initForm = true;
                    this.items = entries;
                    this.totalRecords = totalRecords;
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
    */

}
