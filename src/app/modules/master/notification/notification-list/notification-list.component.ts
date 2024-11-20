import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService} from 'primeng/api';
import { MODE_PAGE, LOOKUP_CATALOG } from 'src/app/models/common';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';
import { TablePageEvent } from 'primeng/table';
@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})
export class NotificationListComponent {

    mode: MODE_PAGE = 'LIST';
    lang: string = 'th';

    receiverList: any[] = [];
    topicList: any[] = [];
    statusList: any[] = [];

    items: any;
    notiInfo:any;

    totalRecords: number = 0;
    rows: number = 5;

    criteria: any = {
      notiRecipient: null,
      notiTopic: null,
      notiDetail:null,
      activeFlag: null,
      first: 0,
      size: 5
    }

    constructor(
      public translate: TranslateService,
      private messageService: MessageService,
      private loaderService: NgxUiLoaderService,
      private dropdownService: DropdownService,
      private confirmationService: ConfirmationService,
      private masterService:MasterService
    ) {
    }

    ngOnInit(): void {
      this.loadDropDownReceiverList();
      this.loadDropDownNotiTopicList();
      this.statusList = [{value:true,nameTh:'ใช้งาน',nameEn:'Active'},{value:false,nameTh:'ไม่ใช้งาน',nameEn:'Inactive'}]
      this.postNotificationData();
      // this.onSearch()
    }

    loadDropDownReceiverList() {
      this.dropdownService
        .getLookup({
          displayCode: false,
          id: LOOKUP_CATALOG.NOTI_RECEIVER_TYPE
        }).subscribe(({ status, message, entries }) => {
          if (status === 200) {
            this.receiverList = entries;
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

  loadDropDownNotiTopicList() {
    this.dropdownService
      .getLookup({
        displayCode: false,
        id: LOOKUP_CATALOG.NOTI_TOPIC
      }).subscribe(({ status, message, entries }) => {
        if (status === 200) {
          this.topicList = entries;
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

  backToFirstPage() {
    let pageFirst = document.getElementsByClassName('p-paginator-first')[0] as HTMLElement;
    pageFirst?.click();
}

  postNotificationData(event?: TablePageEvent) {
      this.loaderService.start();
      if(event){
          this.criteria.size = event.rows;
          this.criteria.first = event.first;
          if (event.rows !== this.rows) {
            this.backToFirstPage();
        }
      } else {
          this.backToFirstPage();
      }

      this.masterService.findNotiInfo(this.criteria).subscribe((result) => {
          this.loaderService.stop();
          if (result.status === 200) {
            this.items = result.entries;
            this.totalRecords = result.totalRecords;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('common.alert.fail'),
              detail: result.message,
              life: 2000
            });
          }
        });

  }

  openPage(event: MODE_PAGE, item?: any) {
    this.loaderService.start();
    if (event === 'LIST') {
      this.loaderService.stop();
      this.mode = event;
      this.onClear();
    } else if (event === 'EDIT') {
      this.loaderService.stop();
        this.notiInfo = item;
        localStorage.setItem('notiInfo', JSON.stringify(this.notiInfo));
      this.mode = event;
    }
  }

  onClear() {
    this.criteria = {
      notiRecipient: null,
      notiTopic: null,
      notiDetail:null,
      activeFlag: null,
      first: 0,
      size: 5
    }
    this.postNotificationData();
  }
}
