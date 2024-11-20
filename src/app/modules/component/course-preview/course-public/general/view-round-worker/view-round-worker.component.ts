import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData, CoursepublicWorkerData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-view-round-worker',
    templateUrl: './view-round-worker.component.html',
    styleUrls: ['./view-round-worker.component.scss']
})
export class ViewRoundWorkerComponent {
    initForm: boolean = false;

    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() lang: string;

    items: CoursepublicWorkerData[] = [];
    totalRecords: number = 0;

    mode: MODE_PAGE = 'LIST';

    editData: CoursepublicWorkerData;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {}
    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.fetchData();
        }
    }
    ngOnInit(): void {}

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CoursepublicWorkerData = {
            coursepublicId: this.coursepublicMain.coursepublicId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicWorker(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
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
