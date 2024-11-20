import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { ToastCloseEvent } from 'primeng/toast';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';

@Component({
    selector: 'app-round-more-detail',
    templateUrl: './round-more-detail.component.html',
    styleUrls: ['./round-more-detail.component.scss']
})
export class RoundMoreDetailComponent {
    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() lang: string;

    @Output() backToList = new EventEmitter();

    initForm: boolean = false;
    processing: boolean = false;
    showError: boolean = false;

    clickYear: boolean = false;

    constructor(
        private messageService: MessageService,
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private courseManagementService: CourseManagementService
    ) {}

    ngOnInit(): void {
        setTimeout(() => {
            this.initForm = true;
        }, 100);
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();

        if (!!!this.coursepublicMain.approvalDate) {
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

        const { costShareCenterPercent, costShareDepPercent, costShareGlobalPercent, costShareManagePercent } = this.coursepublicMain;
        const emptyToZero = (n) => n ? n : 0;
        const sum = emptyToZero(costShareCenterPercent) + emptyToZero(costShareDepPercent) + emptyToZero(costShareGlobalPercent) + emptyToZero(costShareManagePercent);
        if (sum !== 100 && sum !== 0) {
          this.showError = true;
          this.messageService.add({
              severity: 'warn',
              summary: this.translate.instant('common.alert.fail'),
              detail: "ผลรวมส่วนแบ่งค่าลงทะเบียนต้องเป็น 100 เท่านั้น",
              life: 2000
          });
          this.loaderService.stop();
          return;
        }

        if (this.coursepublicMain.coursepublicId) {
            this.courseManagementService
                .putCoursepublicMainMoreDetail(this.coursepublicMain.coursepublicId, this.coursepublicMain)
                .subscribe(({ status, message }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: message,
                            life: 2000
                        });
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
    }

    onBack() {
        this.backToList.emit();
    }

    onClose(event: ToastCloseEvent) {
        this.processing = false;
    }
}
