import {
    Component,
    DoCheck,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MenuItem, MenuItemCommandEvent, MessageService } from 'primeng/api';
import { COURSE_ROUND_PAGE, MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-course-round-main',
    templateUrl: './course-round-main.component.html',
    styleUrls: ['./course-round-main.component.scss']
})
export class CourseRoundMainComponent implements OnInit, DoCheck, OnDestroy, OnChanges {
    // lang: string;
    @Input() lang: string;

    page: COURSE_ROUND_PAGE = COURSE_ROUND_PAGE.ROUND_OPEN_COURSE_ROUND;
    pageType = COURSE_ROUND_PAGE;

    @Input() mode: MODE_PAGE = 'CREATE';

    /** model */
    coursepublicMain: CoursepublicMainData = {};
    /** model */

    /** menu */
    menuItems: MenuItem[] = [];

    @Output() goBack = new EventEmitter();

    initForm: boolean = false;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {
        this.coursepublicMain.coursepublicId =
            +localStorage.getItem('coursepublic') == 0 ? null : +localStorage.getItem('coursepublic');
    }

    ngOnDestroy(): void {
        localStorage.removeItem('coursepublic');
    }

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
        if (!this.initForm) {
            this.initForm = true;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.initialMenu();
        }
    }

    ngOnInit(): void {
        this.initialData();
        this.initialMenu();
        // loadCourse
    }

    initialData() {
        if (this.coursepublicMain.coursepublicId) {
            this.courseManagementService
                .getCoursepublicMain(this.coursepublicMain.coursepublicId)
                .subscribe(({ status, message, entries }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.coursepublicMain = entries;
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
            this.initForm = true;
            this.coursepublicMain = {
                coursepublicId: null,
                activeFlag: true,
                courseClassEnd: null,
                courseClassStart: null,
                coursePublicEnd: null,
                coursePublicStart: null,
                courseRegisEnd: null,
                courseRegisStart: null
            };
        }
    }

    clickMenu(event: MenuItemCommandEvent, pageType: COURSE_ROUND_PAGE) {
        // console.log('event :>> ', event);
        this.page = pageType;
    }

    initialMenu() {
        if (this.coursepublicMain.coursepublicId) {
            this.menuItems = [
                {
                    label: this.translate.instant('courseManagement.menuTab.openCourseRound.name'),
                    items: [
                        {
                            id: `menu${this.pageType.ROUND_OPEN_COURSE_ROUND}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.openCourseRound.tabOpenCourseRound.name'
                            ),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_OPEN_COURSE_ROUND)
                        },
                        {
                            id: `menu${this.pageType.ROUND_LOCATION_AND_STUDY_LOCATION}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.openCourseRound.tabLocationAndStudy.name'
                            ),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_LOCATION_AND_STUDY_LOCATION)
                        },
                        {
                            id: `menu${this.pageType.ROUND_INSTRUCTOR}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.openCourseRound.tabInstructor.name'
                            ),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_INSTRUCTOR)
                        },
                        {
                            id: `menu${this.pageType.ROUND_WORKER}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.openCourseRound.tabWorkerGroup.name'
                            ),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_WORKER)
                        },
                        {
                            id: `menu${this.pageType.ROUND_TEACHING_DOCUMENTS}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.openCourseRound.tabTeachingDocument.name'
                            ),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_TEACHING_DOCUMENTS)
                        },
                        {
                            id: `menu${this.pageType.ROUND_EXPENSES_AND_SHARE_OF_REGISTRATION_FEES}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.openCourseRound.tabExpensesAndShare.cutname'
                            ),
                            state: { test: { name: 'sm' } },
                            command: (e) =>
                                this.clickMenu(e, this.pageType.ROUND_EXPENSES_AND_SHARE_OF_REGISTRATION_FEES)
                        },
                        {
                            id: `menu${this.pageType.ROUND_ACCOMPANYING_VIDEO}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.openCourseRound.tabAccompanyingVideo.name'
                            ),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_ACCOMPANYING_VIDEO)
                        },
                        {
                            id: `menu${this.pageType.ROUND_THUMBNAIL}`,
                            label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabThumbnail.name'),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_THUMBNAIL)
                        },
                        {
                            id: `menu${this.pageType.ROUND_OTHER_ILLUSTRATIONS}`,
                            label: this.translate.instant(
                                'courseManagement.menuTab.openCourseRound.tabOtherIllustrations.name'
                            ),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_OTHER_ILLUSTRATIONS)
                        },
                        {
                            id: `menu${this.pageType.ROUND_CERTIFICATE}`,
                            label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabRoundCertificate.name'),
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_CERTIFICATE)
                        }
                    ]
                }
            ];
            if (this.coursepublicMain.coursepublicStatus == 30014003) {
                const menuItem: MenuItem = {
                    id: `menu${this.pageType.ROUND_MORE_DETAIL}`,
                    label: this.translate.instant('courseManagement.menuTab.openCourseRound.tabMoreDetail.name'),
                    state: { test: { name: 'sm' } },
                    command: (e) => this.clickMenu(e, this.pageType.ROUND_MORE_DETAIL)
                };
                this.menuItems[0].items.push(menuItem);
            }
        } else {
            this.page = COURSE_ROUND_PAGE.ROUND_THUMBNAIL;
            this.menuItems = [
                {
                    label: this.translate.instant('courseManagement.menuTab.openCourseRound.name'),
                    items: [
                        {
                            id: `menu${this.pageType.ROUND_THUMBNAIL}`,
                            label: 'Thumbnail',
                            state: { test: { name: 'sm' } },
                            command: (e) => this.clickMenu(e, this.pageType.ROUND_THUMBNAIL)
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

    afterSaveCourseMain(event?: string) {
        window.scrollTo(0, 0);
        this.coursepublicMain.coursepublicId =
            +localStorage.getItem('coursepublic') == 0 ? null : +localStorage.getItem('coursepublic');
        this.mode = 'EDIT';
        this.initialMenu();
        this.initialData();
        if (event === 'EDIT') {
            this.page = COURSE_ROUND_PAGE.ROUND_OPEN_COURSE_ROUND;
        }
    }

    onBack(event?: any) {
        // console.log('event :>> ', event);
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
