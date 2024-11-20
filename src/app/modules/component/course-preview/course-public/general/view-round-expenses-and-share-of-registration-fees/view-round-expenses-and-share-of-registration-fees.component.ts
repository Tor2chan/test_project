import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-view-round-expenses-and-share-of-registration-fees',
    templateUrl: './view-round-expenses-and-share-of-registration-fees.component.html',
    styleUrls: ['./view-round-expenses-and-share-of-registration-fees.component.scss']
})
export class ViewRoundExpensesAndShareOfRegistrationFeesComponent implements OnInit {
    @Input() lang: string;
    @Input() coursepublicMain!: CoursepublicMainData;

    initForm: boolean = false;

    feeList: DropdownData[] = [];
    facultyList: DropdownData[] = [];
    departmentList: DropdownData[] = [];

    lookupRegistrationCostList: DropdownData[] = [];
    lookupDepartmentLevel1List: DropdownData[] = [];
    lookupDepartmentLevel2List: DropdownData[] = [];

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDropDown();
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
                    this.lookupRegistrationCostList = this.feeList.filter(
                        ({ value }) => value === this.coursepublicMain.feeStatus
                    );
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });

        this.dropdownService.getDepartmentDropdown({
            // depType: 30009001,
            pkId: this.coursepublicMain.depIdLevel1
        }).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentList = entries;
                this.lookupDepartmentLevel1List = this.departmentList.filter(
                    ({ value }) => value === this.coursepublicMain.depIdLevel1
                );
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: message,
                    life: 2000
                });
            }
        });

        this.dropdownService.getDepartmentDropdown({
            // depType: 30009002,
            pkId: this.coursepublicMain.depIdLevel2
        }).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.departmentList = entries;
                this.lookupDepartmentLevel2List = this.departmentList.filter(
                    ({ value }) => value === this.coursepublicMain.depIdLevel2
                );
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
