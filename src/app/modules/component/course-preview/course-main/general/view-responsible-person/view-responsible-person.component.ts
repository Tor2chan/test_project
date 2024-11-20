import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { CourseInstructorData, CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-view-responsible-person',
    templateUrl: './view-responsible-person.component.html',
    styleUrls: ['./view-responsible-person.component.scss']
})
export class ViewResponsiblePersonComponent implements OnInit {
    @Input() lang: string;
    @Input() courseMain: CourseMainData;

    initForm: boolean = false;

    items: CourseInstructorData[] = [];
    totalRecords: number = 0;
    userImg: string = 'assets/layout/images/dummy/dummy.svg';

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService,
        private previewFileSerivce: PreviewFileService
    ) {}

    ngOnInit(): void {
        this.fetchData();
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: CourseInstructorData = {
            courseId: this.courseMain.courseId,
            externalEmail: null,
            externalNameEn: null,
            externalNameTh: null,
            filename: null,
            prefix: null,
            module: null,
            instructorType: false,
            first: 0,
            size: 5,
            instructorMain: false
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCourseInstructor(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.initForm = true;
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
