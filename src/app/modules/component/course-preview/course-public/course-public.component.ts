import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { COURSE_ROUND_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-course-public',
    templateUrl: './course-public.component.html',
    styleUrls: ['./course-public.component.scss']
})
export class CoursePublicComponent implements OnInit, OnChanges {
    @Input() lang: string;
    @Input() coursepublicId: number;

    page: COURSE_ROUND_PAGE = COURSE_ROUND_PAGE.ROUND_OPEN_COURSE_ROUND;
    pageType = COURSE_ROUND_PAGE;

    /** menu */
    menuItems: MenuItem[] = [];

    coursepublicMain: CoursepublicMainData;

    intitForm: boolean = false;

    constructor(
        public translate: TranslateService,
        private courseManagementService: CourseManagementService
    ) {
        // this.coursepublicMain.coursepublicId =
        //     +localStorage.getItem('coursepublic') == 0 ? null : +localStorage.getItem('coursepublic');
    }

    ngOnInit(): void {
        this.initMenu();
        this.loadModel();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.initMenu();
            setTimeout(() => {
                let menuitem = document.querySelector('body > app-root > app-layout > div > div.layout-main-container > div > app-course-preview > div > app-course-public > div > div.container > div > aside > p-menu > div > ul > li:nth-child(2) > a');
                menuitem?.classList.add("active");
            }, 500);
        }
    }

    initMenu() {
        this.menuItems = [
            {
                label: this.translate.instant('courseManagement.menuTab.openCourseRound.name'),
                items: [
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabOpenCourseRound.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_OPEN_COURSE_ROUND)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabLocationAndStudy.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_LOCATION_AND_STUDY_LOCATION)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabInstructor.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_INSTRUCTOR)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabWorkerGroup.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_WORKER)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabTeachingDocument.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_TEACHING_DOCUMENTS)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabExpensesAndShare.cutname'),
                        state: { test: { name: 'sm' } },
                        command: (e) =>
                            this.clickMenu(e, this.pageType.ROUND_EXPENSES_AND_SHARE_OF_REGISTRATION_FEES)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabAccompanyingVideo.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_ACCOMPANYING_VIDEO)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabThumbnail.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_THUMBNAIL)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabOtherIllustrations.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_OTHER_ILLUSTRATIONS)
                    },
                    {
                        label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabRoundCertificate.name'),
                        state: { test: { name: 'sm' } },
                        command: (e) => this.clickMenu(e, this.pageType.ROUND_CERTIFICATE)
                    }
                ]
            }
        ];
    }

    loadModel() {
        this.courseManagementService
            .getCoursepublicMain(this.coursepublicId)
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.coursepublicMain = entries;
                    this.intitForm = true;
                }
            });
    }

    clickMenu(event: MenuItemCommandEvent, pageType: COURSE_ROUND_PAGE) {
        // console.log('event :>> ', event);
        this.page = pageType;
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
