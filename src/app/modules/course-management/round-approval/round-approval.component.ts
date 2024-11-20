import { SafeUrl } from '@angular/platform-browser';
import { DropdownService } from './../../../services/dropdown.service';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownData, LOOKUP_CATALOG } from 'src/app/models/common';
import {
    CoursepublicAttachData,
    CoursepublicInstructorData,
    CoursepublicMainData,
    CoursepublicMediaData,
    CoursepublicWorkerData
} from 'src/app/models/course-management';
import { MasSharePercentData } from 'src/app/models/master';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { environment } from 'src/environments/environment';
import { GlobalService } from 'src/app/services/global-service.service';

type SAVEMODE = 'REQUEST' | 'APPROVE' | 'SENDBACK';

@Component({
    selector: 'app-round-approval',
    templateUrl: './round-approval.component.html',
    styleUrls: ['./round-approval.component.scss']
})
export class RoundApprovalComponent implements OnInit {
    initForm: boolean = false;
    processing: boolean = false;
    showError: boolean = false;

    @Input() lang: string;
    @Input() mode: SAVEMODE;

    masSharePercentData: MasSharePercentData;
    masSharePercentDataItems: MasSharePercentData[] = [];
    masSharePercentDataItemsList: MasSharePercentData[] = [];

    coursepublicMain: CoursepublicMainData;
    coursepublicInstructorItems: CoursepublicInstructorData[] = [];
    coursepublicInstructorTotalRecords: number = 0;
    coursepublicWorkerItems: CoursepublicWorkerData[] = [];
    coursepublicWorkerTotalRecords: number = 0;
    coursepublicAttachItems: CoursepublicAttachData[] = [];
    coursepublicAttachTotalRecords: number = 0;
    coursepublicMediaVideoItems: CoursepublicMediaData[] = [];
    coursepublicMediaVideoTotalRecords: number = 0;
    coursepublicMediaThumbnailItems: CoursepublicMediaData[] = [];
    coursepublicMediaThumbnailTotalRecords: number = 0;
    coursepublicMediaIllustrationItems: CoursepublicMediaData[] = [];
    coursepublicMediaIllustrationTotalRecords: number = 0;
    coursepublicMainCertificateItems: CoursepublicMainData[] = [];
    coursepublicMainCertificateTotalRecords: number = 0;

    @Output() goBack = new EventEmitter();

    certificateList: DropdownData[] = [];
    enrollmentFormatList: DropdownData[] = [];
    teachingConceptList: DropdownData[] = [];
    registrationCostList: DropdownData[] = [];

    lookupCertificateList: DropdownData[] = [];
    lookupEnrollmentFormatList: DropdownData[] = [];
    lookupTeachingConceptList: DropdownData[] = [];
    lookupRegistrationCostList: DropdownData[] = [];
    lookupDepartmentLevel1List: DropdownData[] = [];
    lookupDepartmentLevel2List: DropdownData[] = [];

    departmentLevel1List: DropdownData[] = [];
    departmentLevel2List: DropdownData[] = [];
    certificateNameTh: string[] = [];
    certificateNameEn: string[] = [];

    certificateSignItems: CoursepublicMainData[] = [];
    certificateSignTotalRecords: number = 0;
    clickYear: boolean = false;

    visible: boolean = false;
    base64String: SafeUrl;

    constructor(
        private translate: TranslateService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private previewFileSerivce: PreviewFileService,
        private globalService: GlobalService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            window.scrollTo(0, 0);
            this.loadDropDown();
            this.loadCoursepublicMain();
            this.fetchCoursepublicInstructorData();
            this.fetchCoursepublicWorkerData();
            this.fetchCoursepublicAttachData();
            this.fetchCoursepublicMediaVideoData();
            this.fetchCoursepublicMediaThumbnailData();
            this.fetchCoursepublicMediaIllustrationData();
            this.fetchCertificate();
            this.fetchCertificateSign();

        }, 100);

        setTimeout(() => {
            this.initForm = true;
        }, 200);
    }

    loadCoursepublicMain() {
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        this.courseManagementService.getCoursepublicMain(coursepublicId).subscribe(({ status, message, entries }) => {
            this.initForm = true;
            if (status === 200) {
                this.coursepublicMain = entries;
                this.loadAccessLevel();
                this.fetchSharePercent();

                this.lookupEnrollmentFormatList = this.enrollmentFormatList.filter(
                    ({ value }) => value === this.coursepublicMain.publicFormat
                );
                this.lookupTeachingConceptList = this.teachingConceptList.filter(
                    ({ value }) => value === this.coursepublicMain.courseFormat
                );
                this.lookupRegistrationCostList = this.registrationCostList.filter(
                    ({ value }) => value === this.coursepublicMain.feeStatus
                );

                if (this.coursepublicMain.certificateFormat && this.coursepublicMain.certificateFormat.length > 0) {
                    this.lookupCertificateList = this.certificateList.filter(({ value }) =>
                        this.coursepublicMain.certificateFormat.includes(value)
                    );
                }

                this.lookupCertificateList.forEach((value) => this.certificateNameTh.push(value.nameTh));
                this.lookupCertificateList.forEach((value) => this.certificateNameEn.push(value.nameEn));

            }
        });
    }

    fetchCoursepublicInstructorData(event?: TablePageEvent) {
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        const criteria: CoursepublicInstructorData = {
            coursepublicId: coursepublicId,
            first: 0,
            size: 5,
            activeFlag: true
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicInstructor(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                if (status === 200) {
                    this.initForm = true;
                    this.coursepublicInstructorItems = entries;
                    this.coursepublicInstructorTotalRecords = totalRecords;
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

    fetchCoursepublicWorkerData(event?: TablePageEvent) {
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        const criteria: CoursepublicWorkerData = {
            coursepublicId: coursepublicId,
            first: 0,
            size: 5,
            activeFlag: true
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicWorker(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                if (status === 200) {
                    this.initForm = true;
                    this.coursepublicWorkerItems = entries;
                    this.coursepublicWorkerTotalRecords = totalRecords;
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

    fetchCoursepublicAttachData(event?: TablePageEvent) {
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        const criteria: CoursepublicAttachData = {
            coursepublicId: coursepublicId,
            first: 0,
            size: 5,
            activeFlag: true
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicAttach(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                if (status === 200) {
                    this.initForm = true;
                    this.coursepublicAttachItems = entries;
                    this.coursepublicAttachTotalRecords = totalRecords;
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

    fetchCoursepublicMediaVideoData(event?: TablePageEvent) {
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        const criteria: CoursepublicMediaData = {
            coursepublicId: coursepublicId,
            mediaType: 30012003,
            filename: null,
            first: 0,
            size: 5,
            activeFlag: true
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicMedia(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                if (status === 200) {
                    this.initForm = true;
                    this.coursepublicMediaVideoItems = entries.map((o) => {
                        if (o.filename) {
                            const fullpath = `${environment.apiUrl}/publicfile/${o.prefix}/${o.module}/${o.filename}`;
                            const videoType = `video/${o.filename.split('.')[1]}`;
                            return {
                                ...o,
                                fullpath,
                                videoType
                            };
                        } else {
                            return o;
                        }
                    });
                    this.coursepublicMediaVideoTotalRecords = totalRecords;
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

    fetchCoursepublicMediaThumbnailData(event?: TablePageEvent) {
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        const criteria: CoursepublicMediaData = {
            coursepublicId: coursepublicId,
            mediaType: 30012001,
            filename: null,
            first: 0,
            size: 5,
            activeFlag: true
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicMedia(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                if (status === 200) {
                    this.initForm = true;
                    this.coursepublicMediaThumbnailItems = entries.map((o) => {
                        if (o.filename) {
                            const fullpath = `${environment.apiUrl}/publicfile/${o.prefix}/${o.module}/${o.filename}`;
                            return {
                                ...o,
                                fullpath
                            };
                        } else {
                            return o;
                        }
                    });
                    this.coursepublicMediaThumbnailTotalRecords = totalRecords;
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

    fetchCoursepublicMediaIllustrationData(event?: TablePageEvent) {
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        const criteria: CoursepublicMediaData = {
            coursepublicId: coursepublicId,
            mediaType: 30012002,
            first: 0,
            size: 5,
            activeFlag: true
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        this.courseManagementService
            .findCoursepublicMedia(criteria)
            .subscribe(({ status, message, entries, totalRecords }) => {
                if (status === 200) {
                    this.initForm = true;
                    this.coursepublicMediaIllustrationItems = entries.map((o) => {
                        if (o.filename) {
                            const fullpath = `${environment.apiUrl}/publicfile/${o.prefix}/${o.module}/${o.filename}`;
                            return {
                                ...o,
                                fullpath
                            };
                        } else {
                            return o;
                        }
                    });
                    this.coursepublicMediaIllustrationTotalRecords = totalRecords;
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
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        const criteria: CoursepublicMainData = {
            coursepublicId: coursepublicId,
            first: 0,
            size: 5,
            activeFlag: true
        };
        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }
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
        const coursepublicId = Number(localStorage.getItem('coursepublic'));
        this.courseManagementService.getCoursepublicMain(coursepublicId).subscribe(({ status, message, entries }) => {
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

    fetchSharePercent() {
        this.courseManagementService
                .getSharePercent(this.coursepublicMain.depIdLevel1)
                .subscribe(({ status, message, entries }) => {
                    this.initForm = true;
                if (status === 200) {
                    this.masSharePercentData = entries[0];
                    this.coursepublicMain.costShareCenterPercent = entries[0].costShareCenterPercent;
                    this.coursepublicMain.costShareDepPercent = entries[0].costShareDepPercent;
                    this.coursepublicMain.costShareGlobalPercent = entries[0].costShareGlobalPercent;
                    this.coursepublicMain.costShareManagePercent = entries[0].costShareManagePercent;

                    // this.masSharePercentDataItems = entries;


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

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: true,
                id: LOOKUP_CATALOG.CERTIFICATE_ISSUANCE_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.certificateList = entries;
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
                    this.enrollmentFormatList = entries;
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
                id: LOOKUP_CATALOG.TEACHING_CONCEPT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.teachingConceptList = entries;
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
                id: LOOKUP_CATALOG.REGISTRATION_COST_08
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.registrationCostList = entries;
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

    loadAccessLevel() {
        this.dropdownService
            .getDepartmentDropdown({
                depType: 30009001,
                pkId: this.coursepublicMain.depIdLevel1
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.departmentLevel1List = entries;

                    this.lookupDepartmentLevel1List = this.departmentLevel1List.filter(
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

        this.dropdownService
            .getDepartmentDropdown({
                depType: 30009002,
                pkId: this.coursepublicMain.depIdLevel2
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.departmentLevel2List = entries;

                    this.lookupDepartmentLevel2List = this.departmentLevel2List.filter(
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
    onClose(event: ToastCloseEvent) {
        if (
            event.message.severity === 'success' ||
            event.message.severity === 'warn' ||
            event.message.severity === 'error'
        ) {
            this.processing = false;
        }
    }
    onBack() {
        this.goBack.emit('LIST');
    }
    onSave(saveMode: SAVEMODE) {
        this.processing = true;
        this.loaderService.start();
        if (saveMode === 'APPROVE') {
            if (this.coursepublicMain.feeStatus === 30008002) {
                const { costShareCenterPercent, costShareDepPercent, costShareGlobalPercent, costShareManagePercent } =
                    this.coursepublicMain;
                const emptyToZero = (n) => (n ? n : 0);
                const sum =
                    emptyToZero(costShareCenterPercent) +
                    emptyToZero(costShareDepPercent) +
                    emptyToZero(costShareGlobalPercent) +
                    emptyToZero(costShareManagePercent);

                if (!!!this.coursepublicMain.approvalDate) {
                    this.showError = true;
                    this.messageService.add({
                        severity: 'warn',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant('common.pleaseEnter'),
                        life: 2000
                    });
                    this.loaderService.stop();
                    return;
                } else if (sum !== 100 && sum !== 0) {
                    this.showError = true;
                    this.messageService.add({
                        severity: 'warn',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: 'ผลรวมส่วนแบ่งค่าลงทะเบียนต้องมีค่าเท่ากับ 100%',
                        life: 2000
                    });
                    this.loaderService.stop();
                    return;
                } else {
                    this.coursepublicMain.coursepublicStatus = 30014003;
                    this.coursepublicMain.approvalDate = this.coursepublicMain.approvalDate;
                    this.coursepublicMain.costShareCenterPercent = this.coursepublicMain.costShareCenterPercent;
                    this.coursepublicMain.costShareDepPercent = this.coursepublicMain.costShareDepPercent;
                    this.coursepublicMain.costShareGlobalPercent = this.coursepublicMain.costShareGlobalPercent;
                    this.coursepublicMain.costShareManagePercent = this.coursepublicMain.costShareManagePercent;
                }
            } else {
                if (!!!this.coursepublicMain.approvalDate) {
                    this.showError = true;
                    this.messageService.add({
                        severity: 'warn',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: this.translate.instant('common.pleaseEnter'),
                        life: 2000
                    });
                    this.loaderService.stop();
                    return;
                } else {
                    /** เปิดรอบหลักสูตร */
                    this.coursepublicMain.coursepublicStatus = 30014003;
                    this.coursepublicMain.approvalDate = this.coursepublicMain.approvalDate;
                }
            }
        } else if (saveMode === 'REQUEST') {
            /** รอศูนย์บริการอนุมัติ */
            this.coursepublicMain.coursepublicStatus = 30014002;
        } else if (saveMode === 'SENDBACK') {
            /** รอเปิดหลักสูตร */
            this.coursepublicMain.coursepublicStatus = 30014008;

        }
        this.courseManagementService
            .putCoursepublicMainStatus(this.coursepublicMain.coursepublicId, this.coursepublicMain)
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                    setTimeout(() => {
                        this.onBack();
                    }, 1000);
                } else if (status === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
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

    openCourse() {
        const { courseId } = this.coursepublicMain;
        const origin = window.location.origin;
        const id = {
            coursepublicId: null,
            courseId: courseId
        };
        const enc = window.btoa(JSON.stringify(id));
        setTimeout(() => {
            window.open(`${origin}/course-management/course-preview?data=${enc}`, '_blank');
        }, 50);
    }

    previewPdf(event: any): void {
        this.loaderService.start();
        this.previewFileSerivce
            .postFile({
                filename: event.filename,
                prefix: event.prefix,
                module: event.module
            })
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    const base64ToArrayBuffer = (data) => {
                        const bString = window.atob(data);
                        const bLength = bString.length;
                        const bytes = new Uint8Array(bLength);
                        for (let i = 0; i < bLength; i++) {
                            bytes[i] = bString.charCodeAt(i);
                        }
                        return bytes;
                    };
                    // const filename = this.lang === 'th' ? event.fileNameTh : event.fileNameEn
                    const bufferArray = base64ToArrayBuffer(entries.base64);
                    const blobStore = new Blob([bufferArray], { type: 'application/pdf' });
                    const data = window.URL.createObjectURL(blobStore);
                    this.globalService.openTargetBlank(data);
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

    previewCertificate() {
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
}
