import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { COURSE_PAGE } from 'src/app/models/common';
import { CourseMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-course-main',
    templateUrl: './course-main.component.html',
    styleUrls: ['./course-main.component.scss']
})
export class CourseMainComponent implements OnInit, OnChanges {
    @Input() lang: string;
    @Input() courseId: number;

    page: COURSE_PAGE = COURSE_PAGE.DETAIL_OF_THE_SHORT_TRAINING_COURSE;
    pageType = COURSE_PAGE;

    /** menu */
    menuItems: MenuItem[] = [];

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

    intitForm: boolean = false;

    constructor(public translate: TranslateService, private courseManagementService: CourseManagementService) {}

    ngOnInit(): void {
        this.courseMain.courseId = +localStorage.getItem('course') == 0 ? null : +localStorage.getItem('course');
        this.loadModel();
        setTimeout(() => {
            let menuitem = document.querySelector('body > app-root > app-layout > div > div.layout-main-container > div > app-course-preview > div > app-course-main > div > div.container > div > aside > p-menu > div > ul > li:nth-child(2) > a');
            menuitem?.classList.add("active");
        }, 500);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.initMenu();
        }
    }

    initMenu() {
        this.menuItems = [
            {
                label: this.translate.instant('courseManagement.menuTab.general.name'),
                items: [
                    {
                        label:
                            '*' + this.translate.instant('courseManagement.menuTab.general.tabCourseInformation.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.DETAIL_OF_THE_SHORT_TRAINING_COURSE)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.general.tabTeachingInformation.name'),
                        command: (e) => this.clickMenu(e, this.pageType.TEACHING_FORMAT)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.general.tabIndustryGroup.name'),
                        command: (e) => this.clickMenu(e, this.pageType.INDUSTRY_GROUP_OR_TARGET_GROUP)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.general.tabTeachingProfessor.name'),
                        command: (e) => this.clickMenu(e, this.pageType.RESPONSIBLE_PERSON)
                    },
                    {
                        label: this.translate.instant(
                            'courseManagement.menuTab.general.tabOrganizationsInstitutions.name'
                        ),
                        command: (e) => this.clickMenu(e, this.pageType.RELATED_AGENCIES_OR_ESTABLISHMENTS)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.general.tabCourseMatching.name'),
                        command: (e) => this.clickMenu(e, this.pageType.COURSE_COMPARISON),
                        disabled: !this.courseMain.courseMappingStatus
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.general.tabDocumentsOthers.name'),
                        command: (e) => this.clickMenu(e, this.pageType.DOCUMENTS_AND_MORE)
                    }
                ]
            },
            {
                label: this.translate.instant('courseManagement.menuTab.learningOutcomes.name'),
                items: [
                    {
                        label: this.translate.instant('courseManagement.menuTab.learningOutcomes.learningOutcome.name'),
                        command: (e) => this.clickMenu(e, this.pageType.LEARNING_OUTCOMES)
                    },
                    {
                        label: this.translate.instant(
                            'courseManagement.menuTab.learningOutcomes.expectedLearningOutcomes.name'
                        ),
                        command: (e) => this.clickMenu(e, this.pageType.EXPECTED_LEARNING_OUTCOMES)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.learningOutcomes.learningProcess.name'),
                        command: (e) => this.clickMenu(e, this.pageType.LEARNING_MANAGEMENT_PROCESS)
                    }
                ]
            },
            {
                label: this.translate.instant('courseManagement.menuTab.attachedDocuments.name'),
                items: [
                    {
                        label: this.translate.instant(
                            'courseManagement.menuTab.attachedDocuments.courseApprovalDocuments'
                        ),
                        command: (e) => this.clickMenu(e, this.pageType.COURSE_APPROVAL_DOCUMENTS)
                    }
                ]
            }
        ];
    }

    loadModel() {
        this.courseManagementService.getCourseMain(this.courseId).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.courseMain = entries;
                this.initMenu();
                this.intitForm = true;
            }
        });
    }

    clickMenu(event: MenuItemCommandEvent, pageType: COURSE_PAGE) {
        // console.log('event :>> ', event);
        this.page = pageType;
    }

    activeMenu(event) {
        let node;
        if (event.target.tagName === "A") {
          node = event.target;
        } else {
          node = event.target.parentNode;
        }
        let menuitem = document.getElementsByClassName("p-menuitem-link") ?? [];
        for (let i = 0; i < menuitem.length; i++) {
          menuitem[i].classList.remove("active");
        }
        node.classList.add("active")
    }

}
