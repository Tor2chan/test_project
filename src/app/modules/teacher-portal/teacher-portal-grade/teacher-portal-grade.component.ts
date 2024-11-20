import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { CourseMainData, CoursepublicMainData } from 'src/app/models/course-management';

import { DropdownService } from 'src/app/services/dropdown.service';
import { CallBackData } from '../../component/card-list-common/card-list-common.component';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { TeacherPortalService } from 'src/app/services/teacher-portal.service';
import { MasDepartmentData, MasPersonalData } from 'src/app/models/master';
import { CoursepublicGradeData } from 'src/app/models/course-management/coursepublicGradeData';
import { MasGradeConfigData } from 'src/app/models/master/masGradeConfigData';
import { ConsentManagementListComponent } from '../../master/consent-management/consent-management-list/consent-management-list.component';

@Component({
    selector: 'app-teacher-portal-grade',
    templateUrl: './teacher-portal-grade.component.html',
    styleUrls: ['./teacher-portal-grade.component.scss']
})
export class TeacherPortalGradeComponent {
    @Input() lang: string;

    // page: COURSE_PAGE = COURSE_PAGE.DETAIL_OF_THE_SHORT_TRAINING_COURSE;
    // pageType = COURSE_PAGE;

    @Input() mainmode: MODE_PAGE = 'CREATE';
    @Output() backToListPage = new EventEmitter();
    mode: MODE_PAGE = 'LIST';
    courseInfoData: CoursepublicMainData;
    courseDetail: string = '';
    gradeDetail: CoursepublicGradeData[] = [];
    masGradeDetail: MasGradeConfigData[] = [];
    totalRecords: number;
    pointRangeLost: any;
    countPassingCriteria: number;
    gradeInput: any;
    forceStatus: boolean = false;
    scoreAdd:boolean = false;
    inputGradeList:any[] = [];
    gradeList:any[]=[];
    gradeCalculateMethod: any;
    gradeCalculateMethodList:any[]=[];
    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private loaderService: NgxUiLoaderService,
        private teacherPortalService: TeacherPortalService,
        private dropdownService: DropdownService
    ) {}

    ngOnDestroy(): void {
        localStorage.removeItem('courseinfo');
    }
    ngOnInit(): void {
        console.log("localStorage.getItem('courseinfo')::", JSON.parse(localStorage.getItem('courseinfo')));
        this.courseInfoData = JSON.parse(localStorage.getItem('courseinfo'));
        if(this.courseInfoData.moodleGradeOption!=undefined){
            this.gradeCalculateMethod = this.courseInfoData.moodleGradeOption;
        }
        this.courseDetail =
            this.courseInfoData.courseCode +
            '-' +
            (this.lang === 'th' ? this.courseInfoData.publicNameTh : this.courseInfoData.publicNameEn);
        this.findPassGrade();
        this.findPassingCriteria();
        this.findPointrangeCriteria();
        this.loadDropDownCalculateGradeMethod();
    }
    // this.onSearch()
    findPassGrade(event?: TablePageEvent) {
        if (event) {
            this.courseInfoData.size = 100;
            this.courseInfoData.first = 0;
        }
        this.teacherPortalService.findPassGrade(this.courseInfoData).subscribe((result) => {
            if (result.status == 200) {
                console.log('result.entries::', result.entries);
                // if(result.entries == undefined){
                //     console.log(">>>saveDefaultGrade<<<");
                //     this.saveDefaultGrade()
                // }else{
                if(result.entries!=undefined&&result.entries.length>0){
                    this.gradeDetail = result.entries;
                    for(const element of this.gradeDetail){
                        // console.log("this.gradeDetail[i].scoreMin:::",element.scoreMin);
                        // console.log("this.gradeDetail[i].scoreMax:::",element.scoreMax);
                        // if(element.scoreMin==undefined){
                        //     element.scoreMin=0;
                        // }
                        // if(element.scoreMax==undefined){
                        //     element.scoreMax=0;
                        // }
                        if(element.coursepublicGradeId==undefined){
                            this.saveDefaultGrade(element)
                        }
                        if((element.scoreMin > 0 && element.scoreMin!=undefined) || (element.scoreMax>0 &&element.scoreMax!=undefined)){
                            this.scoreAdd = true;
                            break;
                        }
                    }
                }
                    this.totalRecords = result.totalRecords;
                // }

            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(result.message),
                    life: 2000
                });
            }
        });
        // this.teacherPortalService.findMasterGradeConfig(this.courseInfoData).subscribe((result) => {
        //     if (result.status == 200) {
        //       console.log("result.entries::", result.entries);
        //       this.gradeDetail = result.entries;
        //       this.totalRecords = result.totalRecords;
        //     } else {
        //       this.messageService.add({
        //         severity: 'error',
        //         summary: this.translate.instant('common.alert.fail'),
        //         detail: this.translate.instant(result.message),
        //         life: 2000
        //       });
        //     }
        //   });
    }
    findPassingCriteria() {
        this.teacherPortalService.findPassingCriteria(this.courseInfoData).subscribe((result) => {
            console.log('result:', result);
            if (result.status == 200) {
                console.log('this.countPassingCriteria::', result.totalRecords);
                this.countPassingCriteria = result.totalRecords;
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
    findPointrangeCriteria() {
        this.teacherPortalService.findPointrangeCriteria(this.courseInfoData).subscribe((result) => {
            console.log('result:findPointrangeCriteria:', result);
            if (result.status == 200) {
                this.pointRangeLost = result.entries;
                console.log('this.pointRangeLost::', this.pointRangeLost);
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
        if (event === 'CREATE') {
            if(this.scoreAdd){
                localStorage.setItem('courseinfo', JSON.stringify(this.courseInfoData));
                this.mode = event;
            }else{
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant("teacherPortal.pleaseinputgraderange"),
                    life: 2000
                });
            }
            
        } else if (event === 'LIST') {
            this.mode = event;
            this.findPassGrade();
        } else if (event === 'EDIT') {
            if (item != undefined) {
                this.gradeInput = item;
                this.gradeInput.courseDetail = this.courseDetail;
                this.gradeInput.coursepublicId = this.courseInfoData.coursepublicId;
                localStorage.setItem('courseinfo', JSON.stringify(this.gradeInput));
            } else {
                localStorage.setItem('courseinfo', JSON.stringify(this.courseInfoData));
            }
            this.mode = event;
        }
    }
     onSave(){
        let message;
        // console.log("this.gradeDetail",this.gradeDetail)
        if(this.courseInfoData.moodleGradeOption!=undefined){
            console.log(">>>this.courseInfoData.moodleGradeOption:",this.courseInfoData.moodleGradeOption);
            this.saveMoodleGradeOption(this.courseInfoData);
        }
        
        for (let i = 0; i < this.gradeDetail.length - 1; i++) {
            const currentGrade = this.gradeDetail[i];
            const nextGrade = this.gradeDetail[i + 1];
            // console.log("currentGrade.scoreMin",currentGrade.scoreMin)
            // console.log("nextGrade.scoreMax",nextGrade.scoreMax)
            var rang = currentGrade.scoreMin - nextGrade.scoreMax;
            console.log(currentGrade.gradeSymbol + rang);
            var statusValid = true;
            if (rang > 1 || rang < 0) {
              statusValid = false;  
              console.log("statusValidIN",statusValid);
              // Handle invalid data: scoreMax for current grade should be less than scoreMax for the next grade
              this.messageService.add({
                          severity: 'error',
                          summary: this.translate.instant('common.alert.fail'),
                          detail: this.translate.instant(`Invalid data: scoreMax for ${currentGrade.gradeSymbol} should be less than scoreMax for ${nextGrade.gradeSymbol}`),
                          life: 2000
               });
               return;
                    
            }
   
            
          }

          console.log("statusValid",statusValid);
            if(statusValid){
                for(const element of this.gradeDetail){
                    this.loaderService.start();
                    element.coursepublicId=this.courseInfoData.coursepublicId;
                    console.log("this.gradeDetail::",element);
                    this.teacherPortalService.saveEditGrade(element).subscribe((result) => {
                      if (result.status == 200) {
                        console.log("result.entries:157:", result.entries);
                        this.gradeDetail = result.entries;
                        for(const element of this.gradeDetail){
                            console.log("this.gradeDetail[i].scoreMin:::",element.scoreMin);
                            console.log("this.gradeDetail[i].scoreMax:::",element.scoreMax);
                            // if(element.scoreMin==undefined){
                            //     element.scoreMin=0;
                            // }
                            // if(element.scoreMax==undefined){
                            //     element.scoreMax=0;
                            // }
                            // if(element.coursepublicGradeId==undefined){
                            //     this.saveDefaultGrade(element)
                            // }
                            if((element.scoreMin > 0 && element.scoreMin!=undefined) || (element.scoreMax>0 &&element.scoreMax!=undefined)){
                                this.scoreAdd = true;
                                break;
                            }else{
                                this.scoreAdd = false;
                            }
    
                        }
                        message = result.message;
                        
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
                setTimeout(() => {
                    this.loaderService.stop();
                    // this.gradeDetail =this.gradeList;
                    console.log("this.gradeDetail:178:",this.gradeDetail);
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: message,
                        life: 2000
                    });
                }, 2000);
                }
         


         

      }

    //   saveDefaultGrade(){
    //     this.teacherPortalService.findMasterGradeConfig(this.courseInfoData).subscribe((result) => {
    //         if (result.status == 200) {
    //           console.log("result.entries::", result.entries);
    //           this.gradeDetail = result.entries;
    //           this.totalRecords = result.totalRecords;
    //           for(const element of this.gradeDetail){
    //             element.coursepublicId=this.courseInfoData.coursepublicId;
    //             console.log("this.gradeDetail::",element);
    //             this.teacherPortalService.saveEditGrade(element).subscribe((result) => {
    //               if (result.status == 200) {
    //                 console.log("result.entries:157:", result.entries);
    //                 this.gradeDetail = result.entries;
    //               } else {
    //                 this.messageService.add({
    //                   severity: 'error',
    //                   summary: this.translate.instant('common.alert.fail'),
    //                   detail: this.translate.instant(result.message),
    //                   life: 2000
    //                 });
    //               }
    //             });
    //         }
    //         } else {
    //           this.messageService.add({
    //             severity: 'error',
    //             summary: this.translate.instant('common.alert.fail'),
    //             detail: this.translate.instant(result.message),
    //             life: 2000
    //           });
    //         }
    //       });
    //   }
    saveDefaultGrade(element){
                element.coursepublicId=this.courseInfoData.coursepublicId;
                console.log("this.gradeDetail::",element);
                this.teacherPortalService.saveEditGrade(element).subscribe((result) => {
                  if (result.status == 200) {
                    console.log("result.entries:157:", result.entries);
                    this.gradeDetail = result.entries;
                    for(const element of this.gradeDetail){
                        console.log("this.gradeDetail[i].scoreMin:::",element.scoreMin);
                        console.log("this.gradeDetail[i].scoreMax:::",element.scoreMax);
                        // if(element.scoreMin==undefined){
                        //     element.scoreMin=0;
                        // }
                        // if(element.scoreMax==undefined){
                        //     element.scoreMax=0;
                        // }
                        if((element.scoreMin > 0 && element.scoreMin!=undefined) || (element.scoreMax>0 &&element.scoreMax!=undefined)){
                            this.scoreAdd = true;
                            break;
                        }else{
                            this.scoreAdd = false;
                        }

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

    onBack() {
        this.backToListPage.emit('LIST');
    }
    deleteRow(event: Event, item?: any) {
        console.log('>>>>deleteRow<<<<');
        this.confirmationService.confirm({
            key: 'confirm1',
            target: event.target || new EventTarget(),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                console.log('>>>>yes<<<<');
                this.teacherPortalService.deleteGrade(item).subscribe((result) => {
                    if (result.status == 200) {
                        console.log('result.entries::', result.entries);
                        this.findPassGrade();
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
                this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
            }
        });
    }

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
    loadDropDownCalculateGradeMethod() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.CALCULATE_GRADE_METHOD
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    console.log("entries:", entries);
                    this.gradeCalculateMethodList = entries;
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
    changeGradeCalculateMethod(event: Event, item?: any){
        console.log(">>>item:",item);
        this.courseInfoData.moodleGradeOption = item;
    }

    saveMoodleGradeOption(courseInfoData){
        this.teacherPortalService.saveMoodleGradeOption(courseInfoData).subscribe(results=>{
            if(results.status==200){
                console.log(results.entries);
            }
        });
    };

}
