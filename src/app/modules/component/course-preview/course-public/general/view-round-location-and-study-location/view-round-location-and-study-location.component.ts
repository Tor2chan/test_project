import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-view-round-location-and-study-location',
    templateUrl: './view-round-location-and-study-location.component.html',
    styleUrls: ['./view-round-location-and-study-location.component.scss']
})
export class ViewRoundLocationAndStudyLocationComponent implements OnInit {
    @Input() lang: string;
    @Input() coursepublicMain: CoursepublicMainData;

    initForm: boolean = false;

    courseFormatList: DropdownData[] = [];
    lookupTeachingConceptList: DropdownData[] = [];
    courseTypeList: DropdownData[] = [];

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDropDown();
        this.initForm = true;
    }
    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.TEACHING_CONCEPT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.courseFormatList = entries;
                    this.lookupTeachingConceptList = this.courseFormatList.filter(
                        ({ value }) => value === this.coursepublicMain.courseFormat
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

        this.dropdownService
            .getCourseTypeDropdown({
                displayCode: true
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.courseTypeList = entries;
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
