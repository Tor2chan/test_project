import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { CourseActivityData, CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-view-learning-management-process',
    templateUrl: './view-learning-management-process.component.html',
    styleUrls: ['./view-learning-management-process.component.scss']
})
export class ViewLearningManagementProcessComponent implements OnInit {
    @Input() lang: string;
    @Input() courseMain: CourseMainData;

    initForm: boolean = false;

    items: CourseActivityData[] = [];
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

        const criteria: CourseActivityData = {
            courseId: this.courseMain.courseId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService.findCourseActivity(criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                this.items = result.entries;
                this.totalRecords = result.totalRecords;
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
}
