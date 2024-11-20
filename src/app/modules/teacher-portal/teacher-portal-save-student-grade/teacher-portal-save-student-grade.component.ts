import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { DropdownData, LOOKUP_CATALOG, DropdownCriteriaData } from 'src/app/models/common';
import { DropdownService } from 'src/app/services/dropdown.service';
import { TeacherPortalService } from 'src/app/services/teacher-portal.service';
import { TablePageEvent } from 'primeng/table';
import { MasGradeConfigData } from 'src/app/models/master/masGradeConfigData';
import { MemberCourseData } from 'src/app/models/teacher-portal/memberCourseData';
import { MoodleActivityParams } from 'src/app/models/common/moodleActivityParams';

@Component({
    selector: 'app-teacher-portal-save-student-grade',
    templateUrl: './teacher-portal-save-student-grade.component.html',
    styleUrls: ['./teacher-portal-save-student-grade.component.scss']
})
export class TeacherPortalSaveStudentGradeComponent {
    @Input() lang: string;
    @Input() mainmode: MODE_PAGE = 'APPROVE';
    @Output() backToListPage = new EventEmitter();
    courseInfoData: CoursepublicMainData;
    mode: MODE_PAGE = 'LIST';
    courseDetail: string = '';
    moodleActivityParams: MoodleActivityParams = {
        wstoken: '',
        wsfunction: '',
        moodlewsrestformat: '',
        userid: '',
        courseid: ''
    };
    moodleActivityParamsNew: MoodleActivityParams = {
        wstoken: '',
        wsfunction: '',
        moodlewsrestformat: '',
        userid: '',
        courseid: '',
        coursepublicId: '',
        memberDataList: []
    };

    criteria: any = {
        memberId: null,
        memberNo: null,
        memberFirstnameTh: null,
        memberLastnameTh: null,
        memberFirstnameEn: null,
        memberLastnameEn: null,
        nameOrSurnameTh: null,
        nameOrSurnameEn: null,
        paymentSelect: null,
        studyStatus: null,
        coursepublicId: null,
        first: 0,
        size: 5
    };
    memberCourseData: MemberCourseData = {
        memberId: null,
        resultGrade: null,
        resultScore: null,
        coursepublicId: null
    };
    resultScoreList: any = [];
    gradeSelected: any = {
        gradeSymbol: null,
        score: null,
        resultScore: null,
        resultGrade: null,
        coursepublicId: null,
        memberId: null
    };
    items: MemberCourseData[] = [];
    itemsInput: any;
    paymentList: any[] = [];
    studyStatusList: any[] = [];
    totalRecords: number;
    gradeList: any[] = [];
    totalRecordBeforeSync: number = 0;
    totalRecordAfterSync: number = 0;
    sumGradeRaw: number = 0;
    sendResultFlag: boolean = false;
    pointMoreThan100Flag: boolean = false;
    moodleActivity: any;
    moodleActivityNew: any;
    moodleActivityNewArray: any[] = [];
    processFromMoodleFlag: boolean = false;
    dataChangeFlag: boolean = false;
    passGradeFlag: boolean = false;
    visible: boolean;
    viewData: any;
    defaultPath: any;
    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private teacherPortalService: TeacherPortalService,
        private confirmationService: ConfirmationService,
        private dropdownService: DropdownService
    ) {}
    ngOnInit(): void {
        console.log("localStorage.getItem('courseinfo')::", JSON.parse(localStorage.getItem('courseinfo')));
        this.courseInfoData = JSON.parse(localStorage.getItem('courseinfo'));
        this.criteria.coursepublicId = this.courseInfoData.coursepublicId;
        console.log('this.criteria.coursePublicId::', this.criteria.coursePublicId);
        this.courseDetail =
            this.courseInfoData.courseCode +
            '-' +
            (this.lang === 'th' ? this.courseInfoData.publicNameTh : this.courseInfoData.publicNameEn);
        this.loadDropdownPaymentStatus();
        this.loadDropDownStudyStatus();
        this.loadDropdownGrade();
        this.onSearch();
    }
    fetchData(event, item) {
        console.log(event.target.value);
        this.resultScoreList.push(item);
        console.log('coursepublicId::' + this.courseInfoData.coursepublicId);
        this.gradeSelected.coursepublicId = this.courseInfoData.coursepublicId;
        this.gradeSelected.score = item.resultScore;
        console.log('this.gradeSelected.score::' + this.gradeSelected.score);
        this.teacherPortalService.findPointInRange(this.gradeSelected).subscribe((result) => {
            if (result.status == 200) {
                console.log('result.entries:92:', result.entries);
                if (result.entries != undefined && result.entries.length > 0) {
                    item.resultGrade = result.entries[0].gradeSymbol;
                    item.passStatus = result.entries[0].passStatus;
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
    openPage(event: MODE_PAGE, item?: any) {
        if (event === 'LIST') {
            localStorage.setItem('courseinfo', JSON.stringify(this.courseInfoData));
            this.mode = event;
            this.onSearch();
        } else if (event === 'EDIT') {
            if (item != undefined) {
                this.itemsInput = item;
                this.itemsInput.courseCode = this.courseInfoData.courseCode;
                this.itemsInput.courseDetail = this.courseDetail;
                this.itemsInput.coursepublicId = this.items[0].coursepublicId;
                console.log('itemInput:', this.itemsInput);
                localStorage.setItem('courseinfo', JSON.stringify(this.itemsInput));
            } else {
                localStorage.setItem('courseinfo', JSON.stringify(this.courseInfoData));
            }
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

    onSave(event: Event, item?: any) {
        this.confirmationService.confirm({
            key: 'confirm1',
            target: event.target || new EventTarget(),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                console.log('>>>>yes<<<<');
                this.teacherPortalService.updateStatusCourse(this.criteria).subscribe((result) => {
                    this.loaderService.stop();
                    if (result.status === 200) {
                        console.log('result.entries:106:', result.entries);
                        this.backToListPage.emit('LIST');
                        // this.items = result.entries;
                        // this.totalRecords = result.totalRecords;
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(result.message),
                            life: 2000
                        });
                    }
                });
            },
            reject: () => {
                console.log('>>>>no<<<<');
                // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            }
        });
    }

    onBack(event: Event) {
        if (this.dataChangeFlag) {
            this.confirmationService.confirm({
                key: 'confirmCancel',
                target: event.target || new EventTarget(),
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    console.log('>>>>yes<<<<');
                    this.backToListPage.emit('LIST');
                },
                reject: () => {
                    console.log('>>>>no<<<<');
                    // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
                }
            });
        } else {
            this.backToListPage.emit('LIST');
        }
    }
    loadDropdownPaymentStatus() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.PAYMENT_STATUS
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    // console.log("entries:", entries);
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
                    // console.log("entries:", entries);
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
        this.pointMoreThan100Flag = false;
        this.sendResultFlag = false;
        if (event) {
            this.criteria.size = event.rows;
            this.criteria.first = event.first;
        }
        console.log('this.criteria.size::', this.criteria.size);
        console.log('this.criteria.first::', this.criteria.first);
        console.log('this.criteria:', this.criteria);
        this.teacherPortalService.findStudyResultList(this.criteria).subscribe((result) => {
            this.loaderService.stop();
            if (result.status === 200) {
                console.log('result.entries:183:', result.entries);
                // console.log("totalRecords:",result.totalRecords);
                this.items = result.entries;
                for (const element of this.items) {
                    console.log('element.resultScore:: ', element.resultScore);
                    if (element.resultScore > 100) {
                        this.pointMoreThan100Flag = true;
                    }
                    if (element.studyStatus == 30016002) {
                        this.sendResultFlag = true;
                    }
                }
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
    loadDropdownGrade() {
        if (this.courseDetail != undefined) {
            console.log('this.courseInfoData::', this.courseInfoData);
            this.teacherPortalService.findPassGrade(this.courseInfoData).subscribe((result) => {
                if (result.status == 200) {
                    console.log('dropdowngrade::', result.entries);
                    this.gradeList[0] = { gradeSymbol: 'กรุณาเลือก' };
                    if (result.entries.length > 0) {
                        for (let i = 0; i < result.entries.length; i++) {
                            console.log('result.entries[' + i + ']:', result.entries[i]);
                            this.gradeList[i + 1] = result.entries[i];
                            if (result.entries[i].passStatus == true) {
                                this.passGradeFlag = true;
                            }
                        }
                    } else {
                        this.passGradeFlag = false;
                    }

                    // this.gradeList = result.entries;
                    console.log(this.gradeList);
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
    }
    onClear() {
        this.criteria = {
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
        this.criteria.coursepublicId = this.courseInfoData.coursepublicId;
        this.onSearch();
    }
    onExport() {}

    previewCoursepublic() {
        const { coursepublicId } = this.criteria;
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
    onSaveOnly(item?: any) {
        console.log('item:', item);
        console.log('this.gradeSelected::', this.gradeSelected);
        this.memberCourseData = item;
        // if(this.gradeSelected.gradeSymbol!=undefined){
        //   this.memberCourseData.resultGrade = this.gradeSelected.gradeSymbol;
        // }
        // if(this.gradeSelected.score!=undefined){
        //   this.memberCourseData.resultScore = this.gradeSelected.score;
        // }
        console.log('this.memberCourseData::', this.memberCourseData);
        this.teacherPortalService
            .putMemberData(this.memberCourseData.memberCourseId, this.memberCourseData)
            .subscribe((result) => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.alert.success'),
                    life: 2000
                });
                // this.onSearch();
            });
        this.dataChangeFlag = false;
    }
    onSaveAndConfirm(item?: any) {
        console.log('item:', item);
        this.memberCourseData = item;
        this.memberCourseData.courseCode = this.courseInfoData.courseCode;
        // if(this.gradeSelected.gradeSymbol!=undefined){
        //   this.memberCourseData.resultGrade = this.gradeSelected.gradeSymbol;
        // }
        // if(this.gradeSelected.score!=undefined){
        //   this.memberCourseData.resultScore = this.gradeSelected.score;
        // }
        console.log('item.passStatus>>>', item.passStatus);
        if (!this.passGradeFlag) {
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('teacherPortal.pleaseInputPassStatus'),
                life: 2000
            });
        } else {
            console.log('this.memberCourseData::', this.memberCourseData);
            this.teacherPortalService
                .putConfirmMemberData(this.memberCourseData.memberCourseId, this.memberCourseData)
                .subscribe((result) => {
                    console.log("result::",result);
                    item.studyStatus = result.entries[0].studyStatus;
                    if (item.studyStatus == 30016002) {
                        this.sendResultFlag = true;
                        item.studyStatusNameLo = result.entries[0].studyStatusNameLo;
                        item.studyStatusNameEn = result.entries[0].studyStatusNameEn;
                    }
                    item.resultScore = result.entries[0].resultScore;
                    item.resultGrade = result.entries[0].resultGrade;
                    item.genPdfDate = result.entries[0].genPdfDate;
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: result.message,
                        life: 2000
                    });
                    // this.onSearch();
                });
            this.dataChangeFlag = false;
        }
    }

    openDialog(data: any): void {
        this.visible = true;
        this.viewData = data;
        this.moodleActivityNew = [];
        this.moodleActivity = [];
        this.getMoodleActivity(data);
    }

    formatMoodleCMID(cmid?: any) {
        if (this.moodleActivity && this.moodleActivity.statuses && this.moodleActivity.statuses.length > 0) {
            for (var i = 0; i < this.moodleActivity.statuses.length; i++) {
                if (this.moodleActivity.statuses[i].cmid == cmid.cmid) {
                    // console.log('State = ' + this.moodleActivity.statuses[i].state)
                    return this.moodleActivity.statuses[i].state;
                }
            }
        }
        return null;
    }
    getMoodleActivity(item) {
        this.sumGradeRaw = 0;
        //const moodleApi = 'https://course.lifelong.swu.ac.th/webservice/rest/server.php?wstoken=9153b80e17c7f4f9508a2c80a05bf5aa&wsfunction=core_completion_get_activities_completion_status&courseid=' + this.coursePublicMainItems[0].moodleCourseId + '&userid=' + this.memberInfoData.moodleUserId + '&moodlewsrestformat=json';

        //   const moodleApi = 'https://course.lifelong.swu.ac.th/webservice/rest/server.php?wstoken=9153b80e17c7f4f9508a2c80a05bf5aa&wsfunction=core_completion_get_activities_completion_status&courseid=' + 2 + '&userid=' + this.memberInfoData.moodleUserId + '&moodlewsrestformat=json';
        //  this.studentService.getMoodleActivity().subscribe((result) => {

        //   if(result.status === 200) {

        //   } else {

        //   }
        //})
        // this.http.get(moodleApi).subscribe((data) => {
        //
        //   console.log('API Response:', data);
        //   // Handle the API response data
        // }, (error) => {
        //   console.error('API Error:', error);
        //   // Handle error
        // });

        console.log('item:moodle:', item);
        console.log('this.courseInfoData::', this.courseInfoData);
        //Call moodle api for course name

        // this.moodleActivityParamsNew.wstoken = '9153b80e17c7f4f9508a2c80a05bf5aa';
        this.moodleActivityParamsNew.wsfunction = 'gradereport_user_get_grade_items';
        this.moodleActivityParamsNew.courseid = this.courseInfoData.moodleCourseId
            ? this.courseInfoData.moodleCourseId?.toString()
            : '';
        this.moodleActivityParamsNew.userid = item.moodleUserId ? item.moodleUserId.toString() : '';
        this.moodleActivityParamsNew.moodlewsrestformat = 'json';
        console.log('this.moodleActivityParamsNew::', this.moodleActivityParamsNew);
        this.teacherPortalService.moodleActivity(this.moodleActivityParamsNew).subscribe((result) => {
            this.moodleActivityNew = [];
            this.moodleActivityNewArray = [];
            if (result.status === 200) {
                this.moodleActivityNew = result.entries ? result.entries : undefined;
                // this.moodleActivityNew = {"usergrades":[{"courseid":45,"courseidnumber":"","userid":6484,"userfullname":"\u0e28\u0e34\u0e23\u0e30\u0e40\u0e0a\u0e29\u0e10\u0e4c \u0e1a\u0e38\u0e0d\u0e21\u0e35","useridnumber":"","maxdepth":2,"gradeitems":[{"id":62,"itemname":"\u0e01\u0e23\u0e13\u0e35\u0e28\u0e36\u0e01\u0e29\u0e32: \u0e1a\u0e23\u0e34\u0e29\u0e31\u0e17 ABC \u0e08\u0e33\u0e01\u0e31\u0e14","itemtype":"mod","itemmodule":"assign","iteminstance":4,"itemnumber":0,"idnumber":"","categoryid":45,"outcomeid":null,"scaleid":null,"locked":false,"cmid":81,"weightraw":0.33333000000000002,"weightformatted":"33.33 %","graderaw":95,"gradedatesubmitted":null,"gradedategraded":1716449532,"gradehiddenbydate":false,"gradeneedsupdate":false,"gradeishidden":false,"gradeislocked":false,"gradeisoverridden":false,"gradeformatted":"95.00","grademin":0,"grademax":100,"rangeformatted":"0&ndash;100","percentageformatted":"95.00 %","feedback":"","feedbackformat":0},{"id":63,"itemname":"\u0e01\u0e32\u0e23\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e41\u0e25\u0e30\u0e01\u0e32\u0e23\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19 (submission)","itemtype":"mod","itemmodule":"workshop","iteminstance":1,"itemnumber":0,"idnumber":null,"categoryid":45,"outcomeid":null,"scaleid":null,"locked":false,"cmid":82,"weightraw":0,"weightformatted":"0.00 %","status":"novalue","graderaw":null,"gradedatesubmitted":null,"gradedategraded":null,"gradehiddenbydate":false,"gradeneedsupdate":false,"gradeishidden":false,"gradeislocked":false,"gradeisoverridden":false,"gradeformatted":"-","grademin":0,"grademax":80,"rangeformatted":"0&ndash;80","percentageformatted":"-","feedback":"","feedbackformat":2},{"id":64,"itemname":"\u0e01\u0e32\u0e23\u0e27\u0e32\u0e07\u0e41\u0e1c\u0e19\u0e41\u0e25\u0e30\u0e01\u0e32\u0e23\u0e1a\u0e23\u0e34\u0e2b\u0e32\u0e23\u0e01\u0e32\u0e23\u0e40\u0e07\u0e34\u0e19 (assessment)","itemtype":"mod","itemmodule":"workshop","iteminstance":1,"itemnumber":1,"idnumber":null,"categoryid":45,"outcomeid":null,"scaleid":null,"locked":false,"cmid":82,"weightraw":0,"weightformatted":"0.00 %","status":"novalue","graderaw":null,"gradedatesubmitted":null,"gradedategraded":null,"gradehiddenbydate":false,"gradeneedsupdate":false,"gradeishidden":false,"gradeislocked":false,"gradeisoverridden":false,"gradeformatted":"-","grademin":0,"grademax":20,"rangeformatted":"0&ndash;20","percentageformatted":"-","feedback":"","feedbackformat":2},{"id":65,"itemname":"Quiz \u0e01\u0e32\u0e23\u0e04\u0e33\u0e19\u0e27\u0e13\u0e01\u0e33\u0e44\u0e23\u0e2a\u0e38\u0e17\u0e18\u0e34","itemtype":"mod","itemmodule":"quiz","iteminstance":14,"itemnumber":0,"idnumber":"","categoryid":45,"outcomeid":null,"scaleid":null,"locked":false,"cmid":84,"weightraw":0.33333000000000002,"weightformatted":"33.33 %","graderaw":100,"gradedatesubmitted":1716448265,"gradedategraded":1716448265,"gradehiddenbydate":false,"gradeneedsupdate":false,"gradeishidden":false,"gradeislocked":false,"gradeisoverridden":false,"gradeformatted":"100.00","grademin":0,"grademax":100,"rangeformatted":"0&ndash;100","percentageformatted":"100.00 %","feedback":"","feedbackformat":2},{"id":69,"itemname":"Test \u0e01\u0e32\u0e23\u0e1a\u0e49\u0e32\u0e19 02","itemtype":"mod","itemmodule":"assign","iteminstance":5,"itemnumber":0,"idnumber":"","categoryid":45,"outcomeid":null,"scaleid":null,"locked":false,"cmid":89,"weightraw":0.33333000000000002,"weightformatted":"33.33 %","graderaw":80,"gradedatesubmitted":null,"gradedategraded":1716448894,"gradehiddenbydate":false,"gradeneedsupdate":false,"gradeishidden":false,"gradeislocked":false,"gradeisoverridden":false,"gradeformatted":"80.00","grademin":0,"grademax":100,"rangeformatted":"0&ndash;100","percentageformatted":"80.00 %","feedback":"","feedbackformat":0},{"id":61,"itemname":null,"itemtype":"course","itemmodule":null,"iteminstance":45,"itemnumber":null,"idnumber":null,"categoryid":null,"outcomeid":null,"scaleid":null,"locked":false,"graderaw":275,"gradedatesubmitted":null,"gradedategraded":1716449532,"gradehiddenbydate":false,"gradeneedsupdate":false,"gradeishidden":false,"gradeislocked":false,"gradeisoverridden":false,"gradeformatted":"275.00","grademin":0,"grademax":300,"rangeformatted":"0&ndash;300","percentageformatted":"91.67 %","feedback":"","feedbackformat":2}]}],"warnings":[]}
                console.log('this.moodleActivityNew::', this.moodleActivityNew);
                if (
                    this.moodleActivityNew &&
                    this.moodleActivityNew.usergrades &&
                    this.moodleActivityNew.usergrades.length > 0
                ) {
                    for (var i = 0; i < this.moodleActivityNew.usergrades[0].gradeitems.length; i++) {
                        if (
                            this.moodleActivityNew.usergrades[0].gradeitems[i].itemname != null &&
                            this.moodleActivityNew.usergrades[0].gradeitems[i].cmid != undefined
                        ){
                            this.moodleActivityNewArray.push(this.moodleActivityNew.usergrades[0].gradeitems[i]);
                            console.log("this.moodleActivityNew.usergrades[0].gradeitems[i]::",this.moodleActivityNew.usergrades[0].gradeitems[i]);
                            if(this.moodleActivityNew.usergrades[0].gradeitems[i].graderaw!=undefined){
                                this.sumGradeRaw +=this.moodleActivityNew.usergrades[0].gradeitems[i].graderaw
                                console.log("this.sumGradeRaw::",this.sumGradeRaw);
                            }  
                        }
                        console.log('this.moodleActivityNewArray::', this.moodleActivityNewArray);
                    }
                    this.moodleActivityNew = this.moodleActivityNew.usergrades[0].gradeitems.find(
                        (element: { itemname: any }) => element.itemname != null
                    );
                }
            } else {
                console.log(result.message);
            }
        });

        // this.moodleActivityParams.wstoken = '9153b80e17c7f4f9508a2c80a05bf5aa';
        this.moodleActivityParams.wsfunction = 'core_completion_get_activities_completion_status';
        this.moodleActivityParams.courseid = this.courseInfoData.moodleCourseId
            ? this.courseInfoData.moodleCourseId?.toString()
            : '';
        this.moodleActivityParams.userid = item.moodleUserId ? item.moodleUserId.toString() : '';
        this.moodleActivityParams.moodlewsrestformat = 'json';

        this.teacherPortalService.moodleActivity(this.moodleActivityParams).subscribe((result) => {
            this.moodleActivity = '';
            if (result.status === 200) {
                this.moodleActivity = result.entries ? result.entries : undefined;
                // this.moodleActivity = {"statuses":[{"cmid":80,"modname":"chat","instance":6,"state":1,"timecompleted":1716185998,"tracking":2,"overrideby":null,"valueused":false,"hascompletion":true,"isautomatic":true,"istrackeduser":true,"uservisible":true,"details":[{"rulename":"completionview","rulevalue":{"status":1,"description":"View"}}]},{"cmid":88,"modname":"chat","instance":8,"state":1,"timecompleted":1716447581,"tracking":2,"overrideby":null,"valueused":false,"hascompletion":true,"isautomatic":true,"istrackeduser":true,"uservisible":true,"details":[{"rulename":"completionview","rulevalue":{"status":1,"description":"View"}}]},{"cmid":81,"modname":"assign","instance":4,"state":1,"timecompleted":1716190403,"tracking":2,"overrideby":null,"valueused":false,"hascompletion":true,"isautomatic":true,"istrackeduser":true,"uservisible":true,"details":[{"rulename":"completionview","rulevalue":{"status":1,"description":"View"}},{"rulename":"completionsubmit","rulevalue":{"status":1,"description":"Make a submission"}}]},{"cmid":82,"modname":"workshop","instance":1,"state":1,"timecompleted":1716447590,"tracking":2,"overrideby":null,"valueused":false,"hascompletion":true,"isautomatic":true,"istrackeduser":true,"uservisible":true,"details":[{"rulename":"completionview","rulevalue":{"status":1,"description":"View"}}]},{"cmid":83,"modname":"chat","instance":7,"state":0,"timecompleted":0,"tracking":2,"overrideby":null,"valueused":false,"hascompletion":true,"isautomatic":true,"istrackeduser":true,"uservisible":true,"details":[{"rulename":"completionview","rulevalue":{"status":0,"description":"View"}}]},{"cmid":84,"modname":"quiz","instance":14,"state":1,"timecompleted":1716447766,"tracking":2,"overrideby":null,"valueused":false,"hascompletion":true,"isautomatic":true,"istrackeduser":true,"uservisible":true,"details":[{"rulename":"completionview","rulevalue":{"status":1,"description":"View"}}]}],"warnings":[]}
                console.log('this.moodleActivity::', this.moodleActivity);
            } else {
                console.log(result.message);
            }
        });
    }

    onProcessGradeFromMoodle(event: Event) {
        this.confirmationService.confirm({
            key: 'confirm5',
            target: event.target || new EventTarget(),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.loaderService.start();
                console.log('this.items:::', this.items);
                this.moodleActivityParamsNew.wsfunction = 'gradereport_overview_get_course_grades';
                this.moodleActivityParamsNew.moodlewsrestformat = 'json';
                // this.moodleActivityParamsNew.memberDataList=this.items;
                this.moodleActivityParamsNew.coursepublicId = this.courseInfoData.coursepublicId;
                this.teacherPortalService.moodleGradeList(this.moodleActivityParamsNew).subscribe((result) => {
                    if (result.status === 200) {
                        console.log(result.message);
                        this.onCheckProgress();
                    } else {
                        this.loaderService.stop();
                        console.log(result.message);
                    }
                });
            },
            reject: () => {
                console.log('>>>>no<<<<');
                this.loaderService.stop();
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            }
        });
    }

    onCheckProgress() {
        this.teacherPortalService.getProgressGradeMoodleCheck().subscribe(({ status, message, entries }) => {
            if (status === 200) {
                const data = entries;
                this.totalRecordBeforeSync = data.totalRecordBeforeSync;
                this.totalRecordAfterSync = data.totalRecordAfterSync;
                setTimeout(() => {
                    this.processFromMoodleFlag = true;
                    this.dataChangeFlag = true;
                    // if (this.totalRecordAfterSync < this.totalRecordBeforeSync) {
                    if (!entries.activeFlag) {
                        this.onCheckProgress();
                    } else {
                        this.totalRecordBeforeSync = data.totalRecordBeforeSync;
                        this.totalRecordAfterSync = data.totalRecordBeforeSync;
                        this.loaderService.stop();
                        this.onSearch();
                    }
                }, 2000);
            } else {
                this.loaderService.stop();
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(message),
                    life: 2000
                });
            }
        });
    }

    changeResultScore(event: Event, item: any) {
        console.log('>>>>>changeResultScore<<<<');
        item.changeResultScoreFlag = true;
        this.dataChangeFlag = true;
    }

    changeResultGrade(event: Event, item: any) {
        console.log('>>>>>changeResultGradeFlag<<<<');
        item.changeResultGradeFlag = true;
        this.dataChangeFlag = true;
    }

    printCertificateTh(item: any) {
        console.log('>>>Print certificate<<<');
        console.log(item);
        console.log('export');

        var link = document.createElement('a');
        document.body.appendChild(link);
        link.setAttribute('type', 'hidden');
        if (item.certificateCaPathTh != undefined) {
            this.teacherPortalService
                .findBase64FromFilePath(item.certificateCaPathTh)
                .subscribe(({ status, message, entries }) => {
                    link.href = 'data:application/octet-stream;charset=utf-8;base64,' + entries;
                    let caPathName = item.certificateCaPathTh.split('/');
                    // console.log("caPathname",caPathName);
                    // console.log('entries :>> ', entries);
                    link.download = caPathName[3];
                    link.click();
                });
        }

        document.body.removeChild(link);
    }
    printCertificateEn(item: any) {
        console.log('>>>Print certificate<<<');
        console.log(item);
        console.log('export');

        var link = document.createElement('a');
        document.body.appendChild(link);
        link.setAttribute('type', 'hidden');
        if (item.certificateCaPathEn != undefined) {
            this.teacherPortalService
                .findBase64FromFilePath(item.certificateCaPathEn)
                .subscribe(({ status, message, entries }) => {
                    link.href = 'data:application/octet-stream;charset=utf-8;base64,' + entries;
                    let caPathName = item.certificateCaPathEn.split('/');
                    // console.log("caPathname",caPathName);
                    // console.log('entries :>> ', entries);
                    link.download = caPathName[3];
                    link.click();
                });
        }

        document.body.removeChild(link);
    }
}
