import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { DropdownService } from 'src/app/services/dropdown.service';

@Component({
    selector: 'app-view-round-open-course-round',
    templateUrl: './view-round-open-course-round.component.html',
    styleUrls: ['./view-round-open-course-round.component.scss']
})
export class ViewRoundOpenCourseRoundComponent implements OnInit {
    @Input() lang: string;
    @Input() coursepublicMain!: CoursepublicMainData;

    initForm: boolean = false;

    certificateFormatList: DropdownData[] = [];
    publicFormatList: DropdownData[] = [];

    lookupCertificateList: DropdownData[] = [];
    lookupEnrollmentFormatList: DropdownData[] = [];
    enrollmentFormatList: DropdownData[] = [];

    certificateNameTh: string;
    certificateNameEn: string;

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // this.fetchData();
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);

        setTimeout(() => {
            this.initForm = true;
        }, 200);
        this.loadDropDown();
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.CERTIFICATE_ISSUANCE_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.certificateFormatList = entries;
                    this.certificateNameTh = this.certificateFormatList
                        .filter(({ value }) => (this.coursepublicMain.certificateFormat || []).includes(value))
                        .map(({ nameTh }) => nameTh)
                        .join(', ');
                    this.certificateNameEn = this.certificateFormatList
                        .filter(({ value }) => (this.coursepublicMain.certificateFormat || []).includes(value))
                        .map(({ nameEn }) => nameEn)
                        .join(', ');
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
                id: LOOKUP_CATALOG.COURSE_ENROLLMENT_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.publicFormatList = entries;
                    this.lookupEnrollmentFormatList = this.publicFormatList.filter(
                        ({ value }) => value === this.coursepublicMain.publicFormat
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
