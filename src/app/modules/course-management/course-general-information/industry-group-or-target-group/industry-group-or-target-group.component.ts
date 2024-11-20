import { map } from 'rxjs/operators';
import { filter } from 'rxjs';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CourseMainData, CourseOccupationData, CourseTargetData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastCloseEvent } from 'primeng/toast';
import { CheckboxChangeEvent } from 'primeng/checkbox';

@Component({
    selector: 'app-industry-group-or-target-group',
    templateUrl: './industry-group-or-target-group.component.html',
    styleUrls: ['./industry-group-or-target-group.component.scss']
})
export class IndustryGroupOrTargetGroupComponent implements OnInit {
    @Input() courseMain!: CourseMainData;

    @Input() lang: string;

    processing: boolean = false;
    showError: boolean = false;

    industryGroupList: DropdownData[] = [];
    targetGroupList: DropdownData[] = [];

    // course_target
    courseTargetTemp: number[] = [];
    courseTargetList: CourseTargetData[] = [];

    // multi select
    occupationList: DropdownData[] = [];
    courseOccupationTemp: DropdownData[] = [];
    courseOccupationList: CourseOccupationData[] = [];

    /** course main , couse target , course occupation */

    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {
        // getCourseTargetCourse
    }

    ngOnInit(): void {
        this.loadDropDown();

        setTimeout(() => {
            this.lazyLoadOccupation();
            this.loadFkTable(this.courseMain.courseId);
        }, 150);
        // this.loadCourseOccupation();
    }

    optionLabelFn(option: any): string {

        return `${option.nameTh}  (${option.nameEn})`;

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

    lazyLoadOccupation(event?: DropdownFilterEvent, pkIds?: number[], first?: boolean) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: false
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if ((pkIds || []).length > 0) {
            dropdownCriteriaData.pkIds = pkIds;
        }

        if (this.courseOccupationList.length > 0 && first) {
            dropdownCriteriaData.pkIds = this.courseOccupationList.map(({ occupationId }) => occupationId);
        }

        // if (this.courseOccupationTemp.length > 0) {
        //     dropdownCriteriaData.pkIds = this.courseOccupationTemp.map(({ value }) => value);
        // }

        this.dropdownService.getOccupationCustomLanguageDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {

                let arr: DropdownData[] = [...this.occupationList, ...entries];
                const uniqueArr = arr.filter((obj, index) => {
                    return index === arr.findIndex((o) => obj.value === o.value);
                });

                this.occupationList = uniqueArr;
                if (first) {
                    const list = this.courseOccupationList.map(({ occupationId }) => occupationId);
                    this.courseOccupationTemp = this.occupationList.filter(({ value }) => list.includes(value));
                }

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

    onSave() {
        this.processing = true;
        this.loaderService.start();

        if ( this.courseMain.targetGroupOtherStatus == true ) {
            if ( !!!this.courseMain.targetGroupOtherName ) {
                this.showError = true;
                this.messageService.add({
                    severity: 'warn',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant('common.pleaseEnter'),
                    life: 2000
                });
                this.loaderService.stop();
                return;
            }
        }

        if (!!!this.courseMain.industryGroupId
            || (this.courseOccupationTemp.length == 0)
            || ((this.courseTargetTemp.length == 0) && (this.courseMain.targetGroupOtherStatus == false))
        ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            this.loaderService.stop();
            return;
        }


        this.courseTargetList = [];
        this.courseTargetTemp.forEach((catalogId) => {
            this.courseTargetList = [
                ...this.courseTargetList,
                {
                    courseId: this.courseMain.courseId,
                    targetGroupId: catalogId,
                    activeFlag: true
                }
            ];
        });


        this.courseManagementService
            .putCourseTargetCourse(this.courseMain.courseId, this.courseTargetList)
            .subscribe(({ status, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.courseTargetTemp = entries.map(({ targetGroupId }) => {
                        return targetGroupId;
                    });
                }
            });

        console.log('this.courseOccupationTemp :>> ', this.courseOccupationTemp);
        this.courseOccupationList = this.courseOccupationTemp.map(({ value }) => {
            return {
                activeFlag: true,
                courseId: this.courseMain.courseId,
                occupationId: value
            };
        }) || [];
        console.log('this.courseOccupationList :>> ', this.courseOccupationList);
        // return ;
        // course_occupation
        this.courseManagementService
            .putCourseOccupationCourse(this.courseMain.courseId, this.courseOccupationList)
            .subscribe(({ status, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    // this.courseOccupationTemp = entries.map(({ occupationId }) => {
                    //     return occupationId;
                    // });

                    // --

                    // this.courseActivityMethodList = entries;
                    // this.courseOccupationTemp = this.courseActivityMethodList.map(({ courseMethodId }) => {
                    //     return {
                    //         value: courseMethodId
                    //     };
                    // });
                    // this.lazyLoadMethod(
                    //     null,
                    //     this.courseActivityMethodList.map(({ courseMethodId }) => courseMethodId)
                    // );
                }


            });

        this.courseManagementService
            .putCourseMain(this.courseMain.courseId, this.courseMain)
            .subscribe(({ status, message }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: message,
                        life: 2000
                    });
                    this.afterSaveCourseMain.emit();
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
                this.courseOccupationList = entries;
                this.lazyLoadOccupation(null, null, true);
            }
        });
    }

    onChangeTargetGroupOtherStatus(event: CheckboxChangeEvent) {
        if (event.checked) {

        } else {
            this.courseMain.targetGroupOtherName = null;
        }
    }

    onBack() {
        this.backToList.emit();
    }

    onClose(event: ToastCloseEvent) {
        if (    event.message.severity === 'success'
             || event.message.severity === 'warn'
             || event.message.severity === 'error'
           ) {
            this.processing = false;
        }
    }
}
