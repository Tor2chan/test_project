import { DropdownService } from './../../../services/dropdown.service';
import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { TablePageEvent } from 'primeng/table';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
@Component({
  selector: 'app-round-cancellation',
  templateUrl: './round-cancellation.component.html',
  styleUrls: ['./round-cancellation.component.scss']
})
export class RoundCancellationComponent {
  initForm: boolean = false;
  lang: string = 'th';
  coursepublicId: number;
  courseId: number;
  paymentAmountTotal: number = 0;
  coursepublicMain: CoursepublicMainData;
  courseRegistrationListItems: any;
  courseRegistrationListTotalRecord: any;
  criteria:any={
    coursepublicId:null,
    coursepublicStatus:null,
    cancelReason:null
  };
  approverList:any;
  constructor(private translate: TranslateService,
    private activatedRoute: ActivatedRoute, 
    private courseManagementService: CourseManagementService,
    private confirmationService:ConfirmationService,
    private messageService: MessageService
  ) {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const { coursepublicId, courseId } = this.decodeBase64(params.get('data'));
      this.coursepublicId = coursepublicId;
      this.criteria.coursepublicId = coursepublicId;
      this.courseId = courseId;
      console.log("coursepublicId::", this.coursepublicId);
      console.log("courseId::", this.courseId);
    });
  }
  ngOnInit(): void {
    setTimeout(() => {
      this.loadModel();
      this.fetchCourseRegistrationListData();
    }, 1000);
    
    // this.fetchCourseRegistrationListData();
  }
  ngDoCheck(): void {
    if (this.lang != localStorage.getItem('lang')) {
      this.lang = localStorage.getItem('lang');
    }
  }
  decodeBase64(data) {
    let str = structuredClone(data);
    for (let i = 0; i < str.length; i++) {
      str = str.replace('%3D', '=');
    }
    return JSON.parse(window.atob(str));
  }

  loadModel() {
    this.courseManagementService
      .getCoursepublicMain(this.coursepublicId)
      .subscribe(({ status, message, entries }) => {
        if (status === 200) {
          this.coursepublicMain = entries;
          this.initForm = true;
        }
      });
  }

  fetchCourseRegistrationListData(event?: TablePageEvent,item?:number){
    this.paymentAmountTotal = 0;
    this.courseManagementService.getRegistrationList(this.coursepublicId).subscribe((result)=>{
      console.log("result:",result);
      if(result.status== 200){
        this.courseRegistrationListItems = result.entries;
        for(const element of this.courseRegistrationListItems){
          this.paymentAmountTotal += element.paymentAmount
        }
        console.log("this.paymentAmountTotal::",this.paymentAmountTotal);
        this.courseRegistrationListTotalRecord = result.totalRecords;
        console.log("courseRegistrationListItems:::",this.courseRegistrationListItems);
        console.log("courseRegistrationListTotalRecord:::",this.courseRegistrationListTotalRecord);
      }
    })
  }

  onSendApproval(event: Event, item?: any){
      console.log(">>>send approval<<<<")
      this.confirmationService.confirm({
        key: 'confirm1',
        target: event.target || new EventTarget(),
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            console.log('>>>>yes<<<<');
            item.coursepublicStatus = 30014004;
            console.log('item:: ',item);
            this.courseManagementService.putCancelApproval(this.coursepublicId,item).subscribe((result) => {
                if (result.status == 200) {
                  setTimeout(() => {
                    window.open(`${origin}/course-management/course-round-list`, '_blank');
                  }, 50);
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

  onBack(){
      const origin = window.location.origin;
      setTimeout(() => {
          window.open(`${origin}/course-management/course-round-list`, '_blank');
      }, 50);
  }
}

