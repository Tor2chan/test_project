import { Component, Input, OnInit } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-round-certificate',
  templateUrl: './view-round-certificate.component.html',
  styleUrls: ['./view-round-certificate.component.scss']
})
export class ViewRoundCertificateComponent implements OnInit {
    @Input() lang: string;
    @Input() coursepublicMain!: CoursepublicMainData;

    initForm: boolean = false;

    coursepublicMainCertificateItems: CoursepublicMainData[] = [];
    coursepublicMainCertificateTotalRecords: number = 0;

    certificateSignItems: CoursepublicMainData[] = [];
    certificateSignTotalRecords: number = 0;

    items: CoursepublicMainData[] = [];
    totalRecords: number = 0;

      /** dialog */
      visible: boolean = false;
      base64String: SafeUrl;


    constructor(
        public translate: TranslateService,
        public dropdownService: DropdownService,
        private messageService: MessageService,
        private courseManagementService: CourseManagementService,
        private loaderService: NgxUiLoaderService,


    ) {}

    ngOnInit(): void {
            this.fetchData();
            this.fetchCertificate();
            this.fetchCertificateSign();

    }

    previewPdf() {
        this.loaderService.start();
        this.courseManagementService.getCoursepublicMainCertificate(this.coursepublicMain.coursepublicId).subscribe({
            next: (result) => {
                this.loaderService.stop();
                if (result?.body && result?.headers) {
                    const data = window.URL.createObjectURL(result.body);
                    this.base64String = data;
                    this.visible = true;
                }
            },
            error: (err) => {
                this.loaderService.stop();
                const { status, messages } = err;
                if (messages) {
                    const messageLog = [, , messages];
                }
            }
        });
    }

    fetchData(event?: TablePageEvent) {
        this.loaderService.start();
        console.log('this.coursepublicMain fetchdata :>> ', this.coursepublicMain);
        const criteria: CoursepublicMainData = {
            coursepublicId: this.coursepublicMain.coursepublicId,
            activeFlag: true,

        };

        this.courseManagementService
            .findCoursepublicMain(criteria)
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

    fetchCertificate(event?: TablePageEvent) {
        const criteria: CoursepublicMainData = {
            coursepublicId: this.coursepublicMain.coursepublicId,
            activeFlag: true
        };
        this.courseManagementService
            .findCoursepublicMain(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                if (status === 200) {
                    this.initForm = true;
                    console.log('entriesCertificate :>> ', entries);

                    this.coursepublicMainCertificateItems = entries.map((o) => {

                        if (o.certificateFilenameTh || o.certificateFilenameEn) {
                            const fullpathCertificateFilenameTh = `${environment.apiUrl}/publicfile/${o.certificatePrefixTh}/${o.certificateModuleTh}/${o.certificateFilenameTh}`;
                            const fullpathCertificateFilenameEn = `${environment.apiUrl}/publicfile/${o.certificatePrefixEn}/${o.certificateModuleEn}/${o.certificateFilenameEn}`;

                            console.log('fullpathCertificateFilenameTh :>> ', fullpathCertificateFilenameTh);
                            console.log('fullpathCertificateFilenameEn :>> ', fullpathCertificateFilenameEn);
                            return {
                                ...o,
                                fullpathCertificateFilenameTh,
                                fullpathCertificateFilenameEn
                            };
                        }
                        else {
                            return o;
                        }
                    });
                    this.coursepublicMainCertificateTotalRecords = totalRecords;
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

    fetchCertificateSign(event?: TablePageEvent) {
        this.courseManagementService.getCoursepublicMain(this.coursepublicMain.coursepublicId).subscribe(({ status, message, entries }) => {
             const criteria: CoursepublicMainData = {
            coursepublicId: this.coursepublicMain.coursepublicId,
            activeFlag: true
        };
            this.initForm = true;
            if (status === 200) {
                this.coursepublicMain = entries;
                    for (let i = 0; i < this.coursepublicMain.certificateSignAmount; i++) {
                        const data = {
                            rowNum: i+1,
                            certificateSignFilenameTh: this.coursepublicMain[`certificateSignFilenameTh${i + 1}`],
                            certificateSignModuleTh: this.coursepublicMain[`certificateSignModuleTh${i + 1}`],
                            certificateSignPrefixTh: this.coursepublicMain[`certificateSignPrefixTh${i + 1}`],
                            certificateSignNameTh: this.coursepublicMain[`certificateSignNameTh${i + 1}`],
                            certificateSignPositionTh: this.coursepublicMain[`certificateSignPositionTh${i + 1}`],
                            certificateSignFilenameEn: this.coursepublicMain[`certificateSignFilenameEn${i + 1}`],
                            certificateSignModuleEn: this.coursepublicMain[`certificateSignModuleEn${i + 1}`],
                            certificateSignPrefixEn: this.coursepublicMain[`certificateSignPrefixEn${i + 1}`],
                            certificateSignNameEn: this.coursepublicMain[`certificateSignNameEn${i + 1}`],
                            certificateSignPositionEn: this.coursepublicMain[`certificateSignPositionEn${i + 1}`],

                            fullpathTh: `${environment.apiUrl}/publicfile/${this.coursepublicMain[`certificateSignPrefixTh${i + 1}`]}/${this.coursepublicMain[`certificateSignModuleTh${i + 1}`]}/${this.coursepublicMain[`certificateSignFilenameTh${i + 1}`]}`,
                            fullpathEn: `${environment.apiUrl}/publicfile/${this.coursepublicMain[`certificateSignPrefixEn${i + 1}`]}/${this.coursepublicMain[`certificateSignModuleEn${i + 1}`]}/${this.coursepublicMain[`certificateSignFilenameEn${i + 1}`]}`
                        }
                        this.certificateSignItems.push(data)
                    }
                    this.certificateSignTotalRecords = this.coursepublicMain.certificateSignAmount;
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
