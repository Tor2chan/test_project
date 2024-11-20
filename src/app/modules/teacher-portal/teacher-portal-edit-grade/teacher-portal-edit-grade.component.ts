import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import {  MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData } from 'src/app/models/course-management';

import { TeacherPortalService } from 'src/app/services/teacher-portal.service';
import { CoursepublicGradeData } from 'src/app/models/course-management/coursepublicGradeData';
import { MasGradeConfigData } from 'src/app/models/master/masGradeConfigData';

@Component({
  selector: 'app-teacher-portal-edit-grade',
  templateUrl: './teacher-portal-edit-grade.component.html',
  styleUrls: ['./teacher-portal-edit-grade.component.scss']
})
export class TeacherPortalEditGradeComponent {
  @Input() lang: string;

  // page: COURSE_PAGE = COURSE_PAGE.DETAIL_OF_THE_SHORT_TRAINING_COURSE;
  // pageType = COURSE_PAGE;

  @Input() mode: MODE_PAGE = 'CREATE'
  @Output() goBack = new EventEmitter();
  courseInfoData: any;
  gradeList:any[];
  forceStatus: boolean = false;
  masGradeDetail:MasGradeConfigData[]=[];
  totalRecords:any;
  gradeSelected:any={
  gradeSymbol:null,
  scoreMin:null,
  scoreMax:null,
  coursepublicId:null
  };
  courseDetail: string = '';
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
    console.log("this.courseInfoData::",this.courseInfoData);
    if(this.courseInfoData.coursepublicGradeId!=undefined){
      this.gradeSelected.coursepublicGradeId = this.courseInfoData.coursepublicGradeId;
    }
    this.gradeSelected.gradeSymbol = this.courseInfoData.gradeSymbol;
    this.gradeSelected.scoreMax = this.courseInfoData.scoreMax;
    this.gradeSelected.scoreMin = this.courseInfoData.scoreMin;
    this.loadDropdown();
  }
  loadDropdown() {
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
    }else{
      this.teacherPortalService.findMasterGradeConfig(this.courseInfoData).subscribe((result) => {
        if (result.status == 200) {
          console.log("result.entries::", result.entries);
          this.gradeList = result.entries;
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
  }
  openPage(event: MODE_PAGE, forceStatus?: boolean) {
    if (event === 'LIST') {
      this.forceStatus = forceStatus;
      localStorage.setItem('courseinfo', JSON.stringify(this.courseInfoData));
      this.mode = event;
    }
  }
  onSave(){
    this.gradeSelected.coursepublicId=this.courseInfoData.coursepublicId;
    console.log("this.gradeSelected::",this.gradeSelected);
    this.teacherPortalService.saveEditGrade(this.gradeSelected).subscribe((result) => {
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
          detail: this.translate.instant(result.message),
          life: 2000
        });
      }
    });
  }
  onBack(){
    console.log(">>>Onback<<<");
    this.goBack.emit('LIST');
  }

  findMasterGradeConfig(){
    this.teacherPortalService.findMasterGradeConfig(this.courseInfoData).subscribe((result) => {
      if (result.status == 200) {
        console.log("result.entries::", result.entries);
        this.masGradeDetail = result.entries;
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

}
