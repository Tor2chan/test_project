import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MenuItem, MenuItemCommandEvent, MessageService } from 'primeng/api';
import { COURSE_PAGE, MODE_PAGE } from 'src/app/models/common';
import { CourseMainData } from 'src/app/models/course-management';
import { AutUserData } from 'src/app/models/user-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-course-management-main',
    templateUrl: './course-management-main.component.html',
    styleUrls: ['./course-management-main.component.scss']
})
export class CourseManagementMainComponent implements OnInit, OnDestroy, OnChanges {
    @Input() lang: string;

    page: COURSE_PAGE = COURSE_PAGE.DETAIL_OF_THE_SHORT_TRAINING_COURSE;
    pageType = COURSE_PAGE;

    @Input() mode: MODE_PAGE = 'CREATE';
    @Input() forceStatus: boolean;

    /** model */
    courseMain: CourseMainData = {
        courseActionH: null,
        courseCode: null,
        courseDescEn: null,
        courseDescTh: null,
        courseDurationTime: null,
        courseFormat: null,
        courseFormatDescEn: null,
        courseFormatDescTh: null,
        courseMainStatus: null,
        courseNameEn: null,
        courseNameTh: null,
        courseSpecificRequirementEn: null,
        courseSpecificRequirementTh: null,
        courseTheoryH: null,
        courseTotalH: null,
        creditAmount: null,
        durationTimeUnit: null,
        forceStatus: false,
        gradeFormat: null,
        industryGroupId: null,
        targetGroupOtherName: null,
        targetGroupOtherStatus: null,
        activeFlag: true
    };
    /** model */

    /** menu */
    menuItems: MenuItem[] = [];

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {}

    @Output() goBack = new EventEmitter();

    ngOnDestroy(): void {
        localStorage.removeItem('course');
    }
    ngOnInit(): void {
        this.courseMain.courseId = +localStorage.getItem('course') == 0 ? null : +localStorage.getItem('course');
        this.initialData();
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.initialMenu();
        }
    }

    initialData() {
        if (this.courseMain.courseId) {
            this.loaderService.start();
            this.courseManagementService
                .getCourseMain(this.courseMain.courseId)
                .subscribe(({ status, message, entries }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.courseMain = entries;
                        this.initialMenu();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(message),
                            life: 2000
                        });
                    }
                });
        } else {
            const user: AutUserData = JSON.parse(localStorage.getItem('user')) ?? {};
            const { userId, accessLevel, depIdLevel1, depIdLevel2 } = user;
            this.courseMain = {
                activeFlag: true,
                courseActionH: null,
                courseCode: null,
                courseDescEn: null,
                courseDescTh: null,
                courseDurationTime: null,
                courseFormat: null,
                courseFormatDescEn: null,
                courseFormatDescTh: null,
                courseHashtag: [],
                courseId: null,
                courseMainStatus: null,
                courseNameEn: null,
                courseNameTh: null,
                /** สถานภาพของหลักสูตรอบรมระยะสั้น */
                courseNewStatus: 30022001,
                courseRefId: null,
                courseSpecificRequirementEn: null,
                courseSpecificRequirementTh: null,
                courseTheoryH: null,
                courseTotalH: null,
                courseTypeId: null,
                courseVersion: null,
                creditAmount: null,
                depIdLevel1: null,
                depIdLevel2: null,
                durationTimeUnit: null,
                first: null,
                forceStatus: this.forceStatus,
                gradeFormat: null,
                industryGroupId: null,
                targetGroupOtherName: null,
                targetGroupOtherStatus: null,
                createById: userId
            };

            if (accessLevel) {
                // personal
                this.courseMain.depIdLevel1 = depIdLevel1;
                this.courseMain.depIdLevel2 = depIdLevel2;
            }
        }
    }

    clickMenu(event: MenuItemCommandEvent, pageType: COURSE_PAGE) {
        // console.log('event :>> ', event);
        this.page = pageType;
    }

    initialMenu() {
        if (this.courseMain.courseId) {
            this.menuItems = [
                {
                    label: this.translate.instant('courseManagement.menuTab.general.name'),
                    items: [
                        {
                            id: `menu${this.pageType.DETAIL_OF_THE_SHORT_TRAINING_COURSE}`,
                            label:
                                '*' +
                                this.translate.instant('courseManagement.menuTab.general.tabCourseInformation.name'),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.DETAIL_OF_THE_SHORT_TRAINING_COURSE)
                        },
                        {
                            id: `menu${this.pageType.TEACHING_FORMAT}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.general.tabTeachingInformation.name'
                            ),
                            command: (e) => this.clickMenu(e, this.pageType.TEACHING_FORMAT)
                        },
                        {
                            id: `menu${this.pageType.INDUSTRY_GROUP_OR_TARGET_GROUP}`,
                            label: this.translate.instant('courseManagement.menuTab.general.tabIndustryGroup.name'),
                            command: (e) => this.clickMenu(e, this.pageType.INDUSTRY_GROUP_OR_TARGET_GROUP)
                        },
                        {
                            id: `menu${this.pageType.RESPONSIBLE_PERSON}`,
                            label: this.translate.instant('courseManagement.menuTab.general.tabTeachingProfessor.name'),
                            command: (e) => this.clickMenu(e, this.pageType.RESPONSIBLE_PERSON)
                        },
                        {
                            id: `menu${this.pageType.RELATED_AGENCIES_OR_ESTABLISHMENTS}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.general.tabOrganizationsInstitutions.name'
                            ),
                            command: (e) => this.clickMenu(e, this.pageType.RELATED_AGENCIES_OR_ESTABLISHMENTS)
                        },
                        {
                            id: `menu${this.pageType.COURSE_COMPARISON}`,
                            label: this.translate.instant('courseManagement.menuTab.general.tabCourseMatching.name'),
                            command: (e) => this.clickMenu(e, this.pageType.COURSE_COMPARISON),
                            disabled: !this.courseMain.courseMappingStatus
                        },
                        {
                            id: `menu${this.pageType.DOCUMENTS_AND_MORE}`,
                            label: this.translate.instant('courseManagement.menuTab.general.tabDocumentsOthers.name'),
                            command: (e) => this.clickMenu(e, this.pageType.DOCUMENTS_AND_MORE)
                        }
                    ]
                },
                {
                    label: this.translate.instant('courseManagement.menuTab.learningOutcomes.name'),
                    items: [
                        {
                            id: `menu${this.pageType.LEARNING_OUTCOMES}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.learningOutcomes.learningOutcome.name'
                            ),
                            command: (e) => this.clickMenu(e, this.pageType.LEARNING_OUTCOMES)
                        },
                        {
                            id: `menu${this.pageType.EXPECTED_LEARNING_OUTCOMES}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.learningOutcomes.expectedLearningOutcomes.name'
                            ),
                            command: (e) => this.clickMenu(e, this.pageType.EXPECTED_LEARNING_OUTCOMES)
                        },
                        {
                            id: `menu${this.pageType.LEARNING_MANAGEMENT_PROCESS}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.learningOutcomes.learningProcess.name'
                            ),
                            command: (e) => this.clickMenu(e, this.pageType.LEARNING_MANAGEMENT_PROCESS)
                        }
                    ]
                },
                {
                    label: this.translate.instant('courseManagement.menuTab.attachedDocuments.name'),
                    items: [
                        {
                            id: `menu${this.pageType.COURSE_APPROVAL_DOCUMENTS}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.attachedDocuments.courseApprovalDocuments'
                            ),
                            command: (e) => this.clickMenu(e, this.pageType.COURSE_APPROVAL_DOCUMENTS)
                        }
                    ]
                }
            ];
        } else {
            this.menuItems = [
                {
                    label: this.translate.instant('courseManagement.menuTab.general.name'),
                    items: [
                        {
                            id: `menu${this.pageType.DETAIL_OF_THE_SHORT_TRAINING_COURSE}`,
                            label: '*รายละเอียดหลักสูตรอบรมระยะสั้น',
                            command: (e) => this.clickMenu(e, this.pageType.DETAIL_OF_THE_SHORT_TRAINING_COURSE)
                        }
                    ]
                }
            ];
        }
        if (this.page >= 0) {
            setTimeout(() => {
                let menuitem = document.querySelector(`#menu${this.page}`);
                menuitem?.classList.add('active');
            }, 50);
        }
    }

    afterSaveCourseMain() {
        window.scrollTo(0, 0);
        this.courseMain.courseId = +localStorage.getItem('course') == 0 ? null : +localStorage.getItem('course');
        this.mode = 'EDIT';
        this.initialMenu();
        this.initialData();
    }

    onBack() {
        this.goBack.emit('LIST');
    }

    activeMenu(event) {
        let node;
        if (event.target.tagName === 'A') {
            node = event.target;
        } else {
            node = event.target.parentNode;
        }
        let menuitem = document.getElementsByClassName('p-menuitem-link') ?? [];
        for (let i = 0; i < menuitem.length; i++) {
            menuitem[i].classList.remove('active');
        }
        node.classList.add('active');
    }
}
