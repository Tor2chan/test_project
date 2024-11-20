import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { CoursepublicInstructorData, CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-view-round-instructor',
    templateUrl: './view-round-instructor.component.html',
    styleUrls: ['./view-round-instructor.component.scss']
})
export class ViewRoundInstructorComponent implements OnInit {
    @Input() lang: string;
    @Input() coursepublicMain!: CoursepublicMainData;

    initForm: boolean = false;

    items: CoursepublicInstructorData[] = [];
    totalRecords: number = 0;
    userImg: string = 'assets/layout/images/dummy/dummy.svg';


    constructor(
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.fetchData();
    }
    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CoursepublicInstructorData = {
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
            .findCoursepublicInstructor(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.items = (entries || []).map((o) => {
                        if (o.base64) {
                            const extension = o.filename.split('.')[1]
                            const imgage = `data:image/${extension};base64,${o.base64}`;
                            return {
                                ...o,
                                base64: imgage
                            };
                        } else {
                            return o;
                        }
                    });
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
