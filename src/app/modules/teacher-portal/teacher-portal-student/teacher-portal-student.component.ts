import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { DropdownData, LOOKUP_CATALOG, DropdownCriteriaData } from 'src/app/models/common';
import { DropdownService } from 'src/app/services/dropdown.service';
import { TeacherPortalService } from 'src/app/services/teacher-portal.service';
import { TablePageEvent } from 'primeng/table';
import { MasGradeConfigData } from 'src/app/models/master/masGradeConfigData';
import { MemberCourseData } from 'src/app/models/teacher-portal/memberCourseData';
@Component({
    selector: 'app-teacher-portal-student',
    templateUrl: './teacher-portal-student.component.html',
    styleUrls: ['./teacher-portal-student.component.scss']
})
export class TeacherPortalStudentComponent {
    @Input() lang: string;
    @Input() mainmode: MODE_PAGE = 'EDIT';
    @Output() backToListPage = new EventEmitter();
    courseInfoData: CoursepublicMainData;
    mode: MODE_PAGE = 'LIST';
    courseDetail: string = '';
    criteria: any = {
        memberId: null,
        memberFirstnameTh: null,
        memberLastnameTh: null,
        memberFirstnameEn: null,
        memberLastnameEn: null,
        nameOrSurnameTh: null,
        nameOrSurnameEn: null,
        paymentSelect: null,
        studyStatus: null,
        first: 0,
        size: 5
    };
    items: MemberCourseData[] = [];
    paymentList: any[] = [];
    studyStatusList: any[] = [];
    totalRecords: number;
    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private teacherPortalService: TeacherPortalService,
        private dropdownService: DropdownService
    ) {}
    ngOnInit(): void {
        console.log("localStorage.getItem('courseinfo')::", JSON.parse(localStorage.getItem('courseinfo')));
        this.courseInfoData = JSON.parse(localStorage.getItem('courseinfo'));
        this.courseDetail =
            this.courseInfoData.courseCode +
            '-' +
            (this.lang === 'th' ? this.courseInfoData.publicNameTh : this.courseInfoData.publicNameEn);
        this.loadDropdownPaymentStatus();
        this.loadDropDownStudyStatus();
        this.onSearch();
    }
    openPage(event: MODE_PAGE, item?: any) {
        if (event === 'LIST') {
            localStorage.setItem('courseinfo', JSON.stringify(this.courseInfoData));
            this.mode = event;
        }
        // else if(event === 'LIST'){
        //   this.mode = event;
        //   this.findPassGrade();
        // }else if(event === 'EDIT') {
        //   if(item!=undefined){
        //     this.gradeInput = item;
        //     this.gradeInput.courseDetail = this.courseDetail;
        //     this.gradeInput.coursepublicId = this.courseInfoData.coursepublicId;
        //     localStorage.setItem('courseinfo', JSON.stringify(this.gradeInput));
        //   }else{
        //     localStorage.setItem('courseinfo', JSON.stringify(this.courseInfoData));
        //   }
        //   this.mode = event;
        // }
    }
    onBack() {
        this.backToListPage.emit('LIST');
    }
    loadDropdownPaymentStatus() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.PAYMENT_STATUS
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    console.log('entries:', entries);
                    this.paymentList = entries;
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

    loadDropDownStudyStatus() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.ENROLLMENT_STATUS
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    console.log('entries:', entries);
                    this.studyStatusList = entries;
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
    onSearch(event?: TablePageEvent) {
        this.loaderService.start();
        this.criteria.coursepublicId = this.courseInfoData.coursepublicId;
        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
        }
        console.log('this.criteria:', this.criteria);
        this.teacherPortalService.findStudentList(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                console.log('result.entries:129:', result.entries);
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
    onClear() {
        this.criteria = {
            memberId: null,
            memberFirstnameTh: null,
            memberLastnameTh: null,
            memberFirstnameEn: null,
            memberLastnameEn: null,
            nameOrSurname: null,
            paymentSelect: null,
            studyStatus: null,
            first: 0,
            size: 5
        };
        this.onSearch();
    }
    onExport() {}

    previewCoursepublic() {
        const { coursepublicId } = this.courseInfoData;
        const origin = window.location.origin;
        const id = {
            coursepublicId: coursepublicId,
            courseId: null
        };
        const enc = window.btoa(JSON.stringify(id));
        setTimeout(() => {
            window.open(`${origin}/course-management/course-preview?data=${enc}`, '_blank');
        }, 50);
    }
}
