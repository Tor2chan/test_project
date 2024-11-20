import { Component, DoCheck, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, MenuItem } from 'primeng/api';
import { TablePageEvent } from 'primeng/table';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { MasSharePercentAttachData, MasSharePercentData } from 'src/app/models/master';
import { MasSharePercentHistoryData } from 'src/app/models/master';
import { MasterService } from 'src/app/services/master.service';
@Component({
    selector: 'app-share-percent-manage',
    templateUrl: './share-percent-manage.component.html',
    styleUrls: ['./share-percent-manage.component.scss']
})
export class SharePercentManageComponent implements OnInit, DoCheck{
    showError: boolean = false;
    lang: string;

    itemAttach: MasSharePercentAttachData = {
        depId: null,
        fileLink: null,
        fileName: null
    };

    itemHistory: MasSharePercentHistoryData = {
        depId: null,
        costShareDepPercent: null,
        costShareGlobalPercent: null,
        costShareCenterPercent: null,
        costShareManagePercent:null
    };

    @Input() item!: MasSharePercentData;
    @Input() mode: MODE_PAGE;
    @Output() backToListPage = new EventEmitter();

    itemAttachResult: MasSharePercentAttachData[];
    itemHistoryResult: MasSharePercentHistoryData[];
    criteria = {
        facultyRate: null,
        universityRate: null
    };
    totalRecords: number = 0;

    processing: boolean = false;

    information: MenuItem;
    sharepercent: MenuItem;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService
    ) {
        this.setItems();
    }

    setItems() {
        this.information = {
        label: this.translate.instant('common.module.master'),
        command: () => this.openPage('LIST')
        };

        this.sharepercent = {
        label: this.translate.instant('master.registrationFeeSharing.name'),
        command: () => this.openPage('LIST')
        };
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang']) {
            this.lang = changes['lang'].currentValue;
            this.setItems();
        }
    }

    openPage(page: MODE_PAGE) {
        this.backToListPage.emit('LIST');
    }

    ngOnInit() {
        console.log('mode:', this.mode);
        console.log('item:', this.item);
        this.getHistoryData();
        this.getAttachData();
    }

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.setItems();
        }
    }
    
    onSave() {
        this.processing = true;
        this.loaderService.start();
        if(this.item.costShareCenterPercent+this.item.costShareDepPercent+this.item.costShareGlobalPercent+this.item.costShareManagePercent==100){
            if (this.mode === 'CREATE') {
                this.item.mode = this.mode;
                this.item.updateDate = new Date().toISOString();
                this.itemHistory.costShareDepPercent = this.item.costShareDepPercent;
                this.itemHistory.costShareGlobalPercent = this.item.costShareGlobalPercent;
                this.itemHistory.costShareCenterPercent = this.item.costShareCenterPercent;
                this.itemHistory.costShareManagePercent = this.item.costShareManagePercent;
                this.itemHistory.createDate = this.item.updateDate;
                this.itemHistory.depId = this.item.depId;
                console.log('this.item:', this.item);
                console.log('this.itemAttach:', this.itemAttach);
                console.log('this.itemHistory:', this.itemHistory);
                this.masterService.postSharePercent(this.item).subscribe((result) => {
                    this.loaderService.stop();
                    if (result.status === 200) {
                        this.masterService.postSharePercentHistory(this.itemHistory).subscribe((result) => {
                            this.loaderService.stop();
                            if (result.status === 200) {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: this.translate.instant('common.alert.success'),
                                    detail: this.translate.instant('common.alert.textSuccess'),
                                    life: 2000
                                });
                            } else if (result.status === 204) {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: this.translate.instant('common.alert.fail'),
                                    detail: this.translate.instant(result.message),
                                    life: 2000
                                });
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: this.translate.instant('common.alert.fail'),
                                    detail: this.translate.instant(result.message),
                                    life: 2000
                                });
                            }
                        });
                    } else if (result.status === 204) {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(result.message),
                            life: 2000
                        });
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: this.translate.instant(result.message),
                            life: 2000
                        });
                    }
                });
            } else {
                console.log('else');
            }
        }else{
            this.loaderService.stop();
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant(`common.alert.sharepercentError`),
                life: 2000
                
     });
        }

    }
    getHistoryData(event?: TablePageEvent) {
        this.loaderService.start();

        const criteria: MasSharePercentHistoryData = {
            depId: this.item.depId,
            activeFlag: true,
            first: 0,
            size: 5
        }

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }
        this.masterService.findSharePercentHistory(criteria).subscribe((result) => {
            this.loaderService.stop();
            this.itemHistoryResult = result.entries;
            this.totalRecords = result.totalRecords;
            console.log('this.itemHistoryResult :>> ', this.itemHistoryResult);
            console.log('this.itemkarncheck :>> ', this.item);
        });
    }
    getAttachData() {
        console.log('this.item.sharePercentId:', this.item.sharePercentId);
        console.log('this.itemAttachResult:', this.itemAttachResult);
        this.itemAttach.depId = this.item.depId;
        this.masterService.findSharePercentAttach(this.itemAttach).subscribe((result) => {
            console.log('result:itemAttachResult:', result);
            this.itemAttachResult = result.entries;
        });
    }
    onBack() {
        this.backToListPage.emit('LIST');
    }
    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }
    uploadFile() {}

    deleteRow() {}
}
