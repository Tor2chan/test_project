import { DropdownService } from 'src/app/services/dropdown.service';
import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { ToastCloseEvent } from 'primeng/toast';

@Component({
    selector: 'app-round-expenses-and-share-of-registration-fees',
    templateUrl: './round-expenses-and-share-of-registration-fees.component.html',
    styleUrls: ['./round-expenses-and-share-of-registration-fees.component.scss']
})
export class RoundExpensesAndShareOfRegistrationFeesComponent implements OnInit, DoCheck {
    initForm: boolean = false;
    processing: boolean = false;
    showError: boolean = false;

    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() lang: string;

    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();

    feeList: DropdownData[] = [];
    facultyList: DropdownData[] = [];
    departmentList: DropdownData[] = [];
    masSharePercentData:any;

    clickpromotionStart: boolean = false;
    clickpromotionEnd: boolean = false;

    constructor(
        public dropdownService: DropdownService,
        private messageService: MessageService,
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {}
    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = true;
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.clickpromotionStart = false;
            this.clickpromotionEnd = false;
        }
    }
    ngOnInit(): void {
        console.log("coursepublicMain::: ",this.coursepublicMain);
        if(this.coursepublicMain.costShareDepPercent==undefined && this.coursepublicMain.costShareCenterPercent==undefined&&this.coursepublicMain.costShareGlobalPercent==undefined){
            this.getMasSharePercent(this.coursepublicMain.depIdLevel1)
        }
        this.loadDropDown();

        setTimeout(() => {
            if (!this.coursepublicMain.feeStatus) {
                this.coursepublicMain.feeStatus = 30008002;
            }
        }, 500);
    }

    lazyLoadDepartmentLevel1(event: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009001,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.facultyList = entries;
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

    lazyLoadDepartmentLevel2(event: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009002,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentList = entries;
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
    getMasSharePercent(depId){
        this.courseManagementService.getMasSharePercent(depId).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.masSharePercentData = entries;
                console.log("this.masSharePercentData::",this.masSharePercentData);
                this.coursepublicMain.costShareCenterPercent = this.masSharePercentData[0].costShareCenterPercent;
                this.coursepublicMain.costShareDepPercent = this.masSharePercentData[0].costShareDepPercent;
                this.coursepublicMain.costShareGlobalPercent = this.masSharePercentData[0].costShareGlobalPercent;
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
    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.REGISTRATION_COST_08
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.feeList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });
        setTimeout(() => {
            this.lazyLoadDepartmentLevel1(null, this.coursepublicMain.depIdLevel1);
            this.lazyLoadDepartmentLevel2(null, this.coursepublicMain.depIdLevel2);
        }, 100);
    }
    onSave() {
        this.processing = true;
        this.loaderService.start();

        if (this.coursepublicMain.feeStatus === 30008002) {
            if (
                !!!this.coursepublicMain.feeAmount
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
        }

        if (this.coursepublicMain.coursepublicId) {
            this.courseManagementService
                .putCoursepublicMain(this.coursepublicMain.coursepublicId, this.coursepublicMain)
                .subscribe((result) => {
                    this.loaderService.stop();
                    if (result.status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: this.translate.instant('common.alert.textSuccess'),
                            life: 2000
                        });
                        this.afterSaveCourseMain.emit();
                    } else if (result.status === 204) {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(result.message),
                            life: 2000
                        });
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

    onBack() {
        this.backToList.emit()
    }

    onClose(event: ToastCloseEvent) {
        if (    event.message.severity === 'success'
             || event.message.severity === 'warn'
             || event.message.severity === 'error'
           ) {
            this.processing = false;
        }
    }

    changeFeeStatus() {
        if (this.coursepublicMain.feeStatus == 30008001) {
            this.coursepublicMain.feeAmount = null;
            this.coursepublicMain.promotionAmount = null;
            this.coursepublicMain.promotionStart = null;
            this.coursepublicMain.promotionEnd = null;
        }
    }

}
