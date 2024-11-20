import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { CourseCompanyData, CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-view-related-agencies-or-establishments',
    templateUrl: './view-related-agencies-or-establishments.component.html',
    styleUrls: ['./view-related-agencies-or-establishments.component.scss']
})
export class ViewRelatedAgenciesOrEstablishmentsComponent implements OnInit {
    @Input() lang: string;
    @Input() courseMain: CourseMainData;

    initForm: boolean = false;

    items: CourseCompanyData[] = [];
    totalRecords: number = 0;

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.fetchData();
    }
    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CourseCompanyData = {
            companyAddress: null,
            companyName: null,
            companyOwnerName: null,
            companyTel: null,
            courseId: this.courseMain.courseId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseCompany(criteria)
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
                        detail: this.translate.instant(message),
                        life: 2000
                    });
                }
            });
    }
}
