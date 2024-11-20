import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import {  MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';

import { TeacherPortalService } from 'src/app/services/teacher-portal.service';
import { CoursepublicGradeData } from 'src/app/models/course-management/coursepublicGradeData';
@Component({
  selector: 'app-teacher-portal-create-grade',
  templateUrl: './teacher-portal-create-grade.component.html',
  styleUrls: ['./teacher-portal-create-grade.component.scss']
})
export class TeacherPortalCreateGradeComponent {
  @Input() lang: string;

  // page: COURSE_PAGE = COURSE_PAGE.DETAIL_OF_THE_SHORT_TRAINING_COURSE;
  // pageType = COURSE_PAGE;

  @Input() mode: MODE_PAGE = 'CREATE'
  @Output() goBack = new EventEmitter();
  courseInfoData: CoursepublicMainData;
  gradeList:CoursepublicGradeData[];
  forceStatus: boolean = false;
  gradeSelected:any={
    coursepublicGradeId:null,
    gradeSymbol:null,
    coursepublicId:null,
    createDate:null,
    createById:null
  };
  constructor(
    public translate: TranslateService,
    private messageService: MessageService,
    private loaderService: NgxUiLoaderService,
    private teacherPortalService: TeacherPortalService,
  ) {
  }
  ngOnInit(): void {
    console.log("localStorage.getItem('courseinfo')::", JSON.parse(localStorage.getItem('courseinfo')))
    this.courseInfoData = JSON.parse(localStorage.getItem('courseinfo'));
    this.loadDropdown();
    this.findSelectedGrade();
  }
  loadDropdown() {
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
  openPage(event: MODE_PAGE, forceStatus?: boolean) {
    if (event === 'LIST') {
      this.forceStatus = forceStatus;
      localStorage.setItem('courseinfo', JSON.stringify(this.courseInfoData));
      this.mode = event;
    }
  }
  onSave(){
    console.log("this.courseInfoData::",this.courseInfoData);
    this.gradeSelected.coursepublicId=this.courseInfoData.coursepublicId;
    
    console.log("this.gradeSelected::",this.gradeSelected);
    this.teacherPortalService.savePassGrade(this.gradeSelected).subscribe((result) => {
      if (result.status == 200) {
        console.log("result.entries::", result.entries);
        this.gradeList = result.entries;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.alert.success'),
          detail: result.message,
          life: 2000
      });
      this.onBack();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.alert.fail'),
          detail: this.translate.instant('teacherPortal.passgradenotdefined'),
          life: 2000
        });
      }
    });
  }
  onBack(){
    console.log(">>>Onback<<<");
    this.goBack.emit('LIST');
  }
  findSelectedGrade(){
    console.log(">>>findSelectedGrade<<<");
    this.teacherPortalService.findSelectedGrade(this.courseInfoData).subscribe((result)=>{
      if(result.status==200 && result.entries.length>0){

        this.gradeSelected.coursepublicGradeId = result.entries[0].coursepublicGradeId;
      }
      // else{
      //   this.messageService.add({
      //     severity: 'error',
      //     summary: this.translate.instant('common.alert.fail'),
      //     detail: this.translate.instant('teacherPortal.passgradenotdefined'),
      //     life: 2000
      //   });
      // }
    })
  }
}
