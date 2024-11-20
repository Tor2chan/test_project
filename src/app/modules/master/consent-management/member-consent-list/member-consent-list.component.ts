import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MenuItem, MessageService } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { MODE_PAGE } from 'src/app/models/common';
import { MasConsentDiscloseData, MasConsentManageData, MemberConsentData } from 'src/app/models/master';
import { MemberCourseData } from 'src/app/models/user-management';
import { MasterService } from 'src/app/services/master.service';
import { ReportService } from 'src/app/services/report.service';

@Component({
    selector: 'app-member-consent-list',
    templateUrl: './member-consent-list.component.html',
    styleUrls: ['./member-consent-list.component.scss']
})
export class MemberConsentListComponent implements OnInit, DoCheck {
    lang: string;
    @Input() mode: MODE_PAGE = 'VIEW';
    @Output() goBack = new EventEmitter();
    totalRecords: number = 0;

    information: MenuItem;
    consentmanage: MenuItem;

    @Input() item!: MasConsentManageData;
    items: MemberConsentData[] = [];
    criteria: MemberConsentData = {
        first: 0,
        size: 5,
    };
    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private masterService: MasterService,
        private reportService: ReportService
    ) {}

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.setItems();
        }
    }

    ngOnInit() {
        this.fetchTable();
    }

    setItems() {
        this.information = {
        label: this.translate.instant('common.module.master'),
        command: () => this.openPageBredcrum('LIST')
        };

        this.consentmanage = {
        label: this.translate.instant('master.consentManagement.name'),
        command: () => this.openPageBredcrum('LIST')
        };
  }

  openPageBredcrum(page: MODE_PAGE) {
    this.goBack.emit('LIST');
}

    fetchTable(event?: TablePageEvent) {
        this.loaderService.start();
        const criteria: MemberConsentData = {
            consentId: this.item.consentId,
            activeFlag: true,
            first: 0,
            size: 5
        };
        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        if (this.item.consentId) {
            this.masterService
                .findMemberConsent(criteria) // รอ
                .subscribe(({ status, message, entries, totalRecords }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.items = entries;
                        this.totalRecords = totalRecords;
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
            this.loaderService.stop();
        }
    }
    onBack() {
        this.goBack.emit('LIST');
    }

    onExport(){
        const criteria: MemberConsentData = {
            consentId: this.item.consentId,
            activeFlag: true,
            first: 0,
            size: 5,
            mode: 'excelbase64'
        };
        this.loaderService.start();
        // criteria.mode = 'excelbase64';

        this.masterService.findMemberConsent(criteria).subscribe(({ status, message, entries}) => {
            this.loaderService.stop();
            if (status === 200) {
                console.log('export')

                var link = document.createElement("a");
                    document.body.appendChild(link);
                    link.setAttribute("type", "hidden");
                    link.href = "data:application/octet-stream;charset=utf-8;base64," + entries;
                    //console.log('entries :>> ', entries);
                    link.download = `รายงานข้อมูลผู้ให้ความยินยอม-${new Date().toJSON().slice(0,10).replace(/-/g,'')}.xlsx`;
                    link.click();
                    document.body.removeChild(link);

            }
            else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: message,
                    life: 2000
                })
            }
        })

    }
}
