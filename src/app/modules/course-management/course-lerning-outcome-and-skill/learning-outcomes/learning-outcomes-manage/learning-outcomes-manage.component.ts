import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { CourseSkillData } from 'src/app/models/course-management';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasGeneralSkillLevelData } from 'src/app/models/master';
@Component({
    selector: 'app-learning-outcomes-manage',
    templateUrl: './learning-outcomes-manage.component.html',
    styleUrls: ['./learning-outcomes-manage.component.scss']
})
export class LearningOutcomesManageComponent implements OnInit {
    showError: boolean = false;

    @Input() item!: CourseSkillData;
    @Input() mode: MODE_PAGE;
    @Input() lang: string;

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;
    skillList: DropdownData[] = [];
    levelList: DropdownData[] = [];
    skillLevelData:MasGeneralSkillLevelData= {
        descEn:'',
        descTh:'',
        evaluationEvident:'',
        evaluationCriteria:''
    };
    constructor(
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private courseManagementService: CourseManagementService
    ) {}

    ngOnInit(): void {
        console.log("item::",this.item);
        this.loadDropDown();
        if(this.item.generalSkillId && this.item.skillLevel){
            this.getMasGeneralSkillLevel(this.item);
        }
        setTimeout(() => {
            this.lazyLoadSkillsCategories(null, this.item.generalSkillId);
        }, 250);
    }

    optionLabelFn(option: any): string {

            return `${option.nameTh}  (${option.nameEn})`;

    }

    getUniqueListBy(arr: any[], key) {
        return [...new Map(arr.map(item => [item[key], item])).values()]
    }


    lazyLoadSkillsCategories(event: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: false
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getGeneralSkillCustomLanguageDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.skillList = this.getUniqueListBy([
                    ...this.skillList,
                    ...entries
                ], 'value')
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: this.translate.instant(message),
                    life: 2000
                });
            }
        });
    }

    loadDropDown() {

        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.LEVEL
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.levelList = entries;
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

    onSave() {
        this.processing = true;

        this.loaderService.start();


        if (this.item.courseSkillOtherStatus) {
            if (
                // !!!this.item.generalSkillId ||
                !!!this.item.skillLevel ||
                !!!this.item.skillWeight ||
                !!!this.item.courseSkillOtherNameTh ||
                !!!this.item.courseSkillOtherNameEn
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
        } else if (!!!this.item.generalSkillId || !!!this.item.skillLevel || !!!this.item.skillWeight) {
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
            this.courseManagementService.postCourseSkill(this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
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
        } else if (this.mode === 'EDIT') {
            this.courseManagementService.putCourseSkill(this.item.courseSkillId, this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
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
    onChangeSkillOther() {
        if (this.item.courseSkillOtherStatus) {
            this.item.generalSkillId = null;
        } else {
            this.item.courseSkillOtherNameTh = null;
            this.item.courseSkillOtherNameEn = null;

        }
    }
    getMasGeneralSkillLevel(item?:any){
        console.log("item:",item);
        this.courseManagementService.loadMasGeneralSkillLevel(this.item).subscribe((result) => {
            if (result.status === 200) {
                console.log("result::",result.entries);
                this.skillLevelData = result.entries.length > 0 ? result.entries[0] : {};
            }else{
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
