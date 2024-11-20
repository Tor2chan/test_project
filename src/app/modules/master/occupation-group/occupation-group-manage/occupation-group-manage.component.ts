import { Component, DoCheck, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, MenuItem } from 'primeng/api';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE } from 'src/app/models/common';
import { MasOccupationGroupData } from 'src/app/models/master';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-occupation-group-manage',
    templateUrl: './occupation-group-manage.component.html',
    styleUrls: ['./occupation-group-manage.component.scss']
})

export class OccupationGroupManageComponent implements DoCheck{
    showError: boolean = false;
    lang: string;

    @Input() item!: MasOccupationGroupData;
    @Input() mode: MODE_PAGE;

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;

    information: MenuItem;
    groupinform: MenuItem;

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

        this.groupinform = {
        label: this.translate.instant('master.occupantionGroup.name'),
        command: () => this.openPage('LIST')
        };
    }

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.setItems();
        }
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

    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (
            !!!this.item.occupationGroupCode ||
            !!!this.item.occupationGroupNameTh ||
            !!!this.item.occupationGroupNameEn
        ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            this.loaderService.stop();
            return;
        }

        if (this.mode === 'CREATE') {
            this.masterService.postOccupationGroup(this.item).subscribe((result) => {
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
        } else if (this.mode === 'EDIT') {
            this.masterService.putOccupationGroup(this.item.occupationGroupId, this.item).subscribe((result) => {
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
                        detail: result.message,
                        life: 2000
                    });
                }
            });
        } else {
            console.log('else');
        }
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
}

