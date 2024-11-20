import { Component, DoCheck, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastCloseEvent } from 'primeng/toast';
import { MODE_PAGE, MODE_PAGE_CHILDE } from 'src/app/models/common';
import { MasConsentDiscloseData } from 'src/app/models/master';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-consent-disclose-management',
    templateUrl: './consent-disclose-management.component.html',
    styleUrls: ['./consent-disclose-management.component.scss']
})
export class ConsentDiscloseManagementComponent implements OnInit, DoCheck {
    showError: boolean = false;
    initForm: boolean = false;

    @Input() item!: MasConsentDiscloseData;

    lang: string;

    @Output() backToMain = new EventEmitter();

    @Input() modeChilde: MODE_PAGE_CHILDE = 'MAIN';

    @Output() backToListPage = new EventEmitter();

    @Input() mode: MODE_PAGE;

    processing: boolean = false;

    information: MenuItem;
    consentmanage: MenuItem;
    manage: MenuItem;

    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private masterService: MasterService
    ) {}
    ngDoCheck(): void {
        if (!this.initForm) {
            this.initForm = !this.initForm;
            this.item;
            this.setItems();
        }
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
        }
    }

    ngOnInit() {
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

        this.manage = {
            label: this.translate.instant('menu.master.consent.name'),
            command: () => this.onBack()
            };
  }

  openPageBredcrum(page: MODE_PAGE) {
    this.backToListPage.emit('LIST');
}

    onCloseLevel2(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToMain.emit();
        }
        this.processing = false;
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();

        if (!!!this.item.consentDiscloseTh ) {
            this.showError = true;
            this.messageService.add({
                severity: 'warn',
                summary: this.translate.instant('common.alert.fail'),
                detail: this.translate.instant('common.pleaseEnter'),
                life: 2000
            });
            this.loaderService.stop();
            this.processing = false;
            return;
        }

        this.loaderService.start();
      if (this.item.consentDiscloseId) {
        console.log(2)
          this.masterService.putConsentDisclose(this.item.consentDiscloseId, this.item).subscribe((result) => {
              this.loaderService.stop();
              if (result.status === 200) {
                  this.item = result.entries;

                  this.backToMain.emit(this.item);

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
      }else if (this.item.consentId) {
        console.log(3)
          this.masterService.postConsentDisclose(this.item).subscribe((result) => {
              this.loaderService.stop();
              if (result.status === 200) {
                  this.item = result.entries;
                  this.backToMain.emit(this.item);
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
        console.log(4)
          console.log('else');
          const consentDiscloseTh =  this.item.consentDiscloseTh;
          this.item = {
              ...this.item,
              consentDiscloseTh
          };
          this.loaderService.stop();
          this.backToMain.emit(this.item);
      }

  }
  onBack() {
    this.backToMain.emit();
  }
}
