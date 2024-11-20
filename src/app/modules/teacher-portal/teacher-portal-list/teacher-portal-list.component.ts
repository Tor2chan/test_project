import { Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, MenuItem } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { CourseMainData, CoursepublicMainData } from 'src/app/models/course-management';
import { DropdownService } from 'src/app/services/dropdown.service';
import { CallBackData } from '../../component/card-list-common/card-list-common.component';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TeacherPortalService } from 'src/app/services/teacher-portal.service';
import { environment } from 'src/environments/environment';
import { MasDepartmentData, MasPersonalData } from 'src/app/models/master';
import { ReportService } from 'src/app/services/report.service';
import { AutUserData } from 'src/app/models/user-management';
@Component({
    selector: 'app-teacher-portal-list',
    templateUrl: './teacher-portal-list.component.html',
    styleUrls: ['./teacher-portal-list.component.scss']
})
export class TeacherPortalListComponent implements DoCheck, OnInit {
    // criteriaExport: any {

    // }
    criteria: any = {
        coursepublicStatus: null,
        coursepublicId: null,
        teacherSelected: null,
        activeFlag: true,
        personalId: null,
        publicNameTh: null,
        publicNameEn: null,
        first: 0,
        size: 5
    };
    initForm: any;
    lang: string = 'th';
    statusList: CourseMainData;
    deptList: DropdownData[] = [];
    activeFlagList: DropdownData[] = [];
    courseOpeningStatus: DropdownData[] = [];
    courseTypeList: DropdownData[] = [];
    teacherData: MasPersonalData;
    teacherDataList: DropdownData[] = [];
    departmentName: string;
    departmentData: MasDepartmentData;
    coursepublicMainData: CoursepublicMainData;
    courseInfoData: CoursepublicMainData[] = [];
    courseStatus: string;
    courseInput: MasPersonalData = {};
    activeCourse: number;
    totalRecords: number = 0;
    items: CourseMainData[] = [];
    teacherName: string = '';
    imgSrc: any;
    firstAlphabet: string;
    mode: MODE_PAGE = 'LIST';
    forceStatus: boolean = false;
    memberCount: number = 0;
    accessLevel: number | null;
    breadcrumItems: MenuItem[];
    constructor(
        private translate: TranslateService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private teacherPortalService: TeacherPortalService,
        private reportService: ReportService,
        private router: Router
    ) {
        this.initForm = true;
        const user: AutUserData = JSON.parse(localStorage.getItem('user')) ?? {};
        const { accessLevel, depIdLevel1, depIdLevel2 } = user;

        this.accessLevel = accessLevel;
        console.log('this.accessLevel:: ', this.accessLevel);

        this.breadcrumItems = [
            { label: this.translate.instant('menu.teacherPortal.name'), command: () => this.openPage('LIST') },
            {
                label: this.translate.instant('menu.teacherPortal.teaherManagement.course'),
                routerLink: '/teacher-portal/teacher-course'
            }
        ];
    }

    ngOnInit(): void {
        // this.lazyLoadDepartment();
        this.loadDropdown();
        this.getPersonalData();
        this.onSearch();
    }

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.activeFlagList = [
                { value: true, nameTh: this.translate.instant('common.status.active') },
                { value: false, nameTh: this.translate.instant('common.status.inActive') },
                { value: null, nameTh: this.translate.instant('common.status.all') }
            ];

            this.breadcrumItems = [
                { label: this.translate.instant('menu.teacherPortal.name'), command: () => this.openPage('LIST') },
                {
                    label: this.translate.instant('menu.teacherPortal.teaherManagement.course'),
                    routerLink: '/teacher-portal/teacher-course'
                }
            ];
        }
    }

    getPersonalData() {
        this.teacherPortalService.getPersonalData().subscribe(({ status, message, entries }) => {
            if (status === 200) {
                if (entries != undefined) {
                    console.log('teacherData::', entries);
                    this.teacherData = entries[0];
                    const prefix = this.teacherData.prefix;
                    const module = this.teacherData.module;
                    const filename = this.teacherData.personalPhotoPath;
                    this.imgSrc = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                    console.log('imgSrc:', this.imgSrc);
                    console.log('>>>>teacher:', this.teacherData);
                    if (this.teacherData.depIdLevel1 != undefined) {
                        this.getDepartment(this.teacherData.depIdLevel1);
                    }
                    this.courseInput.personalId = this.teacherData.personalId;
                    this.criteria.personalId = this.teacherData.personalId;
                    this.firstAlphabet = this.teacherData.firstnameTh.substring(0, 1);
                    console.log('this.firstAlphabet :', this.firstAlphabet);
                    if (this.accessLevel == 30025001) {
                        console.log('this.criteria.teacherName::', this.criteria.teacherName);
                        if (this.lang == 'th') {
                            this.lazyLoadTeacher(null, this.teacherData.firstnameTh);
                            this.criteria.teacherName =
                                this.teacherData.prefixShortTh +
                                ' ' +
                                this.teacherData.firstnameTh +
                                ' ' +
                                this.teacherData.lastnameTh;
                        } else {
                            this.lazyLoadTeacher(null, this.teacherData.firstnameTh);
                            this.criteria.teacherName =
                                this.teacherData.prefixShortEn +
                                ' ' +
                                this.teacherData.firstnameEn +
                                ' ' +
                                this.teacherData.lastnameEn;
                        }
                    } else {
                        if (this.lang == 'th') {
                            this.criteria.teacherName =
                                this.teacherData.prefixShortTh +
                                ' ' +
                                this.teacherData.firstnameTh +
                                ' ' +
                                this.teacherData.lastnameTh;
                        } else {
                            this.criteria.teacherName =
                                this.teacherData.prefixShortEn +
                                ' ' +
                                this.teacherData.firstnameEn +
                                ' ' +
                                this.teacherData.lastnameEn;
                        }
                    }
                    this.getActiveCourse(this.teacherData.personalId);
                    this.findCourseInfo(this.courseInput);
                }
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
    getPersonalDataById(personalId) {
        console.log('personalId::', personalId);
        if (personalId != undefined) {
            this.teacherPortalService.getPersonalDataById(personalId).subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    if (entries != undefined) {
                        console.log('teacherData::', entries);
                        this.teacherData = entries[0];
                        const prefix = this.teacherData.prefix;
                        const module = this.teacherData.module;
                        const filename = this.teacherData.personalPhotoPath;
                        this.imgSrc = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        console.log('imgSrc:', this.imgSrc);
                        console.log('>>>>teacher:', this.teacherData);
                        if (this.teacherData.depIdLevel1 != undefined) {
                            this.getDepartment(this.teacherData.depIdLevel1);
                        }
                        this.courseInput.personalId = this.teacherData.personalId;
                        this.criteria.personalId = this.teacherData.personalId;

                        if (this.accessLevel == 30025001) {
                            console.log('this.criteria.teacherName::', this.criteria.teacherName);
                            if (this.lang == 'th') {
                                this.lazyLoadTeacher(null, this.teacherData.firstnameTh);
                                this.criteria.teacherName =
                                    this.teacherData.prefixShortTh +
                                    ' ' +
                                    this.teacherData.firstnameTh +
                                    ' ' +
                                    this.teacherData.lastnameTh;
                            } else {
                                this.lazyLoadTeacher(null, this.teacherData.firstnameTh);
                                this.criteria.teacherName =
                                    this.teacherData.prefixShortEn +
                                    ' ' +
                                    this.teacherData.firstnameEn +
                                    ' ' +
                                    this.teacherData.lastnameEn;
                            }
                        } else {
                            if (this.lang == 'th') {
                                this.criteria.teacherName =
                                    this.teacherData.prefixShortTh +
                                    ' ' +
                                    this.teacherData.firstnameTh +
                                    ' ' +
                                    this.teacherData.lastnameTh;
                            } else {
                                this.criteria.teacherName =
                                    this.teacherData.prefixShortEn +
                                    ' ' +
                                    this.teacherData.firstnameEn +
                                    ' ' +
                                    this.teacherData.lastnameEn;
                            }
                        }
                        this.getActiveCourse(personalId);
                        this.findCourseInfo(this.courseInput);
                    }
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
    // onGetTeacherData() {
    //     this.teacherPortalService.findAllPersonalData().subscribe(({ status, message, entries }) => {
    //         if (status === 200) {
    //             if (entries != undefined) {
    //                 console.log("teacherDataList::",entries)
    //                 this.teacherDataList = entries;
    //                 // const prefix = this.teacherData.prefix;
    //                 // const module = this.teacherData.module;
    //                 // const filename = this.teacherData.personalPhotoPath;
    //                 // this.imgSrc = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
    //                 // console.log('imgSrc:', this.imgSrc);
    //                 // console.log('>>>>teacher:', this.teacherData);
    //                 // if (this.teacherData.depIdLevel1 != undefined) {
    //                 //     this.getDepartment(this.teacherData.depIdLevel1);
    //                 // }
    //                 // this.courseInput.personalId = this.teacherData.personalId;
    //                 // this.criteria.personalId = this.teacherData.personalId;
    //                 // this.getActiveCourse(this.teacherData.personalId);
    //                 // this.findCourseInfo(this.courseInput);
    //             }
    //         } else {
    //             this.messageService.add({
    //                 severity: 'error',
    //                 summary: this.translate.instant('common.alert.fail'),
    //                 detail: this.translate.instant(message),
    //                 life: 2000
    //             });
    //         }
    //     });
    // }
    lazyLoadTeacher(event: DropdownFilterEvent, item?: any) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        } else if (item != undefined) {
            dropdownCriteriaData.searchValue = item;
        }

        this.dropdownService.getTeacherDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.teacherDataList = entries;
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

    getDepartment(depIdLevel1) {
        this.teacherPortalService.getDepartment(depIdLevel1).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                if (entries != undefined) {
                    this.departmentData = entries[0];
                    if (this.lang == 'th') {
                        this.departmentName = this.departmentData.depNameTh;
                    } else {
                        this.departmentName = this.departmentData.depNameEn;
                        console.log('>>>>departmentName:', this.departmentName);
                    }
                }
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

    getActiveCourse(personalId) {
        this.teacherPortalService.getActiveCourse(personalId).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                if (entries != undefined) {
                    this.coursepublicMainData = entries[0];
                    this.activeCourse = this.coursepublicMainData.countActived;
                    console.log('>>>>activeCourse:', this.activeCourse);
                }
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

    onSearch(event?: TablePageEvent) {
        // this.loaderService.start();
        console.log('>>>>onsearch<<<');
        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
        }
        this.findCourseInfo(this.criteria);
    }

    onClear() {
        this.criteria = {
            coursepublicStatus: null,
            coursepublicId: null,
            activeFlag: true,
            personalId: null,
            publicNameTh: null,
            publicNameEn: null,
            first: 0,
            size: 5
        };
    }
    onImport() {}
    onExport() {}
    //---Exam Data---
    titleStatus: string = 'รอส่ง';

    callBack(event: CallBackData) {
        if (event.eventName === 'EDIT') {
            const data: CoursepublicMainData = event.data;
            localStorage.setItem('courseinfo', JSON.stringify(data));
            this.mode = 'EDIT';
        } else if (event.eventName === 'APPROVE') {
            const data: CoursepublicMainData = event.data;
            localStorage.setItem('courseinfo', '' + JSON.stringify(data));
            this.mode = 'APPROVE';
        } else if (event.eventName === 'REQUEST') {
            const data: CourseMainData = event.data;
            localStorage.setItem('course', '' + data.courseId);
            this.mode = 'REQUEST';
        } else if (event.eventName === 'CREATE') {
            console.log('>>>>>grade click<<<<');
            const data: CoursepublicMainData = event.data;
            console.log('>>>>data::', data);
            localStorage.setItem('courseinfo', JSON.stringify(data));
            this.mode = 'CREATE';
        } else if (event.eventName === 'PRINT') {
            console.log('>>>PRINT<<<');
            const data: CoursepublicMainData = event.data;
            localStorage.setItem('courseinfo', '' + JSON.stringify(data));
            this.onExportExcel(data);
        } else if (event.eventName === 'LIST') {
            console.log('>>>LIST<<<');
            const data: CoursepublicMainData = event.data;
            this.mode = 'LIST';
        } else if (event.eventName === 'VIEW') {
            const data: CoursepublicMainData = event.data;
            const { coursepublicId } = data;
            const origin = window.location.origin;
            const id = {
                coursepublicId: coursepublicId,
                courseId: null
            };
            const enc = window.btoa(JSON.stringify(id));
            setTimeout(() => {
                window.open(`${origin}/course-management/course-preview?data=${enc}`, '_blank');
            }, 50);
        } else if (event.eventName === 'MOODLE') {
            const { personalId } = event.data as MasPersonalData;
            this.loaderService.start();
            this.teacherPortalService.moodle(personalId).subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200 && entries) {
                    setTimeout(() => {
                        window.open(entries, '_blank');
                    }, 50);
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

    lazyLoadDepartment(event?: DropdownFilterEvent) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            depType: 30009001,
            displayCode: true
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getDepartmentDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.deptList = entries;
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

    loadDropdown() {
        this.dropdownService
            .getLookup({ displayCode: true, id: LOOKUP_CATALOG.COURSE_OPENING_STATUS, pkIds: [30014003, 30014006] })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    console.log('entries::', entries);
                    this.courseOpeningStatus = entries;
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

    openPage(event: MODE_PAGE) {
        if (event === 'CREATE') {
            this.mode = event;
        } else if (event === 'LIST') {
            localStorage.removeItem('courseinfo');
            this.mode = event;
            this.onSearch();
        }
    }

    findCourseInfo(courseInput) {
        this.loaderService.start();
        if (courseInput.publicNameTh == '') {
            courseInput.publicNameTh = undefined;
        }
        if (courseInput.publicNameEn == '') {
            courseInput.publicNameEn = undefined;
        }
        this.teacherPortalService.findCourseInfo(courseInput).subscribe((result) => {
            if (result.status === 200) {
                this.loaderService.stop();
                setTimeout(() => {
                    window.scrollTo(0, 0);
                }, 100);
                console.log('result.entries::', result.entries);
                if (result.entries != undefined) {
                    this.courseInfoData = result.entries;
                    this.totalRecords = result.totalRecords;
                    console.log('courseInfoData:267:', this.courseInfoData);
                    for (let i = 0; i < this.courseInfoData.length; i++) {
                        this.criteria.coursepublicId = this.courseInfoData[i].coursepublicId;
                        this.findMemberCount(this.criteria, this.courseInfoData[i]);
                    }
                    for (const element of this.courseInfoData) {
                        const prefix = element.prefix;
                        const module = element.module;
                        const filename = element.filename;
                        element.imgSrc = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        console.log('element.imgSrc::', element.imgSrc);
                    }
                } else {
                    this.courseInfoData = result.entries;
                    this.totalRecords = result.totalRecords;
                }
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

    findMemberCount(criteria, item) {
        this.teacherPortalService.findMemberCount(criteria).subscribe((result) => {
            if (result.status === 200) {
                console.log('memberCount:entries:', result.entries);
                for (let i = 0; i < result.entries.length; i++) {
                    item.memberCount = result.entries[i].memberCount;
                }
                // this.memberCount = result.entries[0].memberCount;
                // this.memberCount = result.entries;
                // this.totalRecords = result.totalRecords;
                // console.log("courseInfoData::",this.courseInfoData);
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

    onExportExcel(data: CoursepublicMainData) {
        this.loaderService.start();
        let criteria: CoursepublicMainData = {
            mode: 'excelbase64',
            coursepublicId: data.coursepublicId
        };

        this.reportService.findGradeExportList(criteria).subscribe(({ status, message, entries }) => {
            this.loaderService.stop();
            if (status === 200) {
                var link = document.createElement('a');
                document.body.appendChild(link);
                link.setAttribute('type', 'hidden');
                link.href = 'data:application/octet-stream;charset=utf-8;base64,' + entries;
                //console.log('entries :>> ', entries);
                link.download = `ส่งออกเกรด-${new Date().toJSON().slice(0, 10).replace(/-/g, '')}.xlsx`;
                link.click();
                document.body.removeChild(link);
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
