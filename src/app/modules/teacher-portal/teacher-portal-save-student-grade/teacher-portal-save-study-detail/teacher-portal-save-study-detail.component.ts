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
  selector: 'app-teacher-portal-save-study-detail',
  templateUrl: './teacher-portal-save-study-detail.component.html',
  styleUrls: ['./teacher-portal-save-study-detail.component.scss']
})
export class TeacherPortalSaveStudyDetailComponent {
  @Input() lang: string;
  @Input() mainmode: MODE_PAGE = 'EDIT'
  @Output() backToListPage = new EventEmitter();
  courseInfoData: any;
  mode: MODE_PAGE = 'LIST';
  courseDetail: string = '';
  criteria: any = {
    memberId: null,
    memberFirstnameTh:null,
    memberLastnameTh:null,
    memberFirstnameEn:null,
    memberLastnameEn:null,
    paymentSelect: null,
    statusSelect: null,
    first: 0,
    size: 5
  }
  items:MemberCourseData[] = [];
  paymentList: any[] = [];
  studyStatusList: any[] = [];
  totalRecords:number;
  gradeList:any[];
  gradeSelected:any={
    gradeSymbol:null,
    score:null,
    resultScore:null,
    resultGrade:null,
    coursepublicId:null,
    memberId:null,
  }
  memberCourseData:MemberCourseData={
    memberId:null,
    resultGrade:null,
    resultScore:null,
    coursepublicId:null
  };
  constructor(
    public translate: TranslateService,
    private messageService: MessageService,
    private loaderService: NgxUiLoaderService,
    private teacherPortalService: TeacherPortalService,
    private dropdownService: DropdownService
  ) {
  }
  ngOnInit(): void {
    this.courseInfoData = JSON.parse(localStorage.getItem('courseinfo'));
    console.log("this.courseInfoData::",this.courseInfoData);
    if(this.courseInfoData.courseDetail!=undefined){
      this.gradeSelected.memberId =this.courseInfoData.memberId;
      this.gradeSelected.score = this.courseInfoData.resultScore;
      this.gradeSelected.gradeSymbol = this.courseInfoData.resultGrade;
      this.courseDetail = this.courseInfoData.courseDetail;
    }else{
      this.courseDetail = this.courseInfoData.courseCode + '-' + (this.lang === 'th' ? this.courseInfoData.publicNameTh : this.courseInfoData.publicNameEn);
    }this.loadDropdownPaymentStatus();
    this.loadDropDownStudyStatus();
    this.loadDropdownGrade();
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
      }).subscribe(({ status, message, entries }) => {
        if (status === 200) {
          console.log("entries:", entries);
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
      }).subscribe(({ status, message, entries }) => {
        if (status === 200) {
          console.log("entries:", entries);
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
  fetchData(event){
    console.log(event.target.value);
    console.log("coursepublicId::"+this.courseInfoData.coursepublicId);
    this.gradeSelected.coursepublicId=this.courseInfoData.coursepublicId;
    this.teacherPortalService.findPointInRange(this.gradeSelected).subscribe((result) => {
      if(result.status==200){
        console.log("result.entries:172:",result.entries);
        if(result.entries!=undefined){
          this.gradeSelected.gradeSymbol = result.entries[0].gradeSymbol;
        }
        
      }else {
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
    if(this.courseInfoData.courseDetail!=undefined){
      console.log("this.courseInfoData::",this.courseInfoData);
      this.teacherPortalService.findPassGrade(this.courseInfoData).subscribe((result) => {
        if (result.status == 200) {
          console.log("result.entries::", result.entries);
          this.gradeList = result.entries;
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
  onSave(item?:any){
    console.log("item:",item);
    this.memberCourseData = item;
    if(this.gradeSelected.gradeSymbol!=undefined){
      this.memberCourseData.resultGrade = this.gradeSelected.gradeSymbol;
    }
    if(this.gradeSelected.score!=undefined){
      this.memberCourseData.resultScore = this.gradeSelected.score;
    }
    console.log("this.memberCourseData::",this.memberCourseData);
    this.teacherPortalService.putMemberData(this.memberCourseData.memberCourseId,this.memberCourseData).subscribe((result) => {
      this.onBack();
    });
  }
  onSaveAndConfirm(item?:any){
    console.log("item:",item);
    this.memberCourseData = item;
    this.memberCourseData.courseCode = this.courseInfoData.courseCode;
    if(this.gradeSelected.gradeSymbol!=undefined){
      this.memberCourseData.resultGrade = this.gradeSelected.gradeSymbol;
    }
    if(this.gradeSelected.score!=undefined){
      this.memberCourseData.resultScore = this.gradeSelected.score;
    }
    console.log("this.memberCourseData::",this.memberCourseData);
    this.teacherPortalService.putConfirmMemberData(this.memberCourseData.memberCourseId,this.memberCourseData).subscribe((result) => {
      this.onBack();
    });
  }
  onExport() { }
  previewCoursepublic() {
    console.log('this.criteria:',this.criteria);
    console.log('this.courseInfoData ::',this.courseInfoData );
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
