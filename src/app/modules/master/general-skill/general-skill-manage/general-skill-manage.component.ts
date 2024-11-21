import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ToastCloseEvent } from 'primeng/toast';
import { isEmpty } from 'rxjs';
import { DropdownCriteriaData, DropdownData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { MasGeneralSkillData } from 'src/app/models/master';
import { MasGeneralSkillLevelData } from 'src/app/models/master/masGeneralSkillLevelData';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { orderBy} from 'lodash' ;

@Component({
    selector: 'app-general-skill-manage',
    templateUrl: './general-skill-manage.component.html',
    styleUrls: ['./general-skill-manage.component.scss']
})
export class GeneralSkillManageComponent implements OnInit {
    showError: boolean = false;

    @Input() item!: MasGeneralSkillData;
    @Input() mode: MODE_PAGE;
    @Input() lang: string;

    showUpload: boolean = true;
    showErrorOverImg: boolean = false;
    isImageSizeValid: boolean = false;

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;

    categorySkillList: DropdownData[] = [];

    levelList: DropdownData[] = [];
    skill: MasGeneralSkillLevelData[] = [];
    // skillLevelList: MasGeneralSkillLevelData[] = [];

    imgSrc: string = 'assets/layout/images/dummy/dummy.svg';

    information: MenuItem;
    skillinform: MenuItem;

    activeIndex: number = 0;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private loaderService: NgxUiLoaderService,
        private previewFileSerivce: PreviewFileService,
        private uploadFileService: UploadFileService
    ) {
        this.setItems();
    }

    setItems() {
        this.information = {
            label: this.translate.instant('common.module.master'),
            command: () => this.openPage('LIST')
        };

        this.skillinform = {
            label: this.translate.instant('master.generalSkill.name'),
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

    ngOnInit(): void {
        this.loadDropDown();
        this.loadImage();
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.categorySkillList = [{ value: null, nameTh: this.translate.instant('common.pleaseSelect') }];
        }
        if (this.item.skillLevelList){
            this.item.skillLevelList = orderBy(this.item.skillLevelList, ['levelNo'], ['asc']);

        }
    }

    onAdvancedUpload(event: FileUploadHandlerEvent) {
        this.loaderService.start();
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            if (
                img.naturalWidth < 200 ||
                img.naturalHeight < 200 ||
                img.naturalWidth > 200 ||
                img.naturalHeight > 200
            ) {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.alert.fail'),
                    detail: 'กรุณาใส่ภาพขนาดไม่เกิน 200x200 px',
                    life: 2000
                });
                this.showErrorOverImg = true;
                return;
            } else {
                this.uploadFileService.postCoursepublic(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.item.filename = entries.filename;
                        this.item.prefix = entries.prefix;
                        this.item.module = entries.module;
                        const extension = entries.filename.split('.')[1];
                        this.imgSrc = `data:image/${extension};base64,${entries.base64}`;
                        this.showUpload = false;
                        this.showErrorOverImg = false;
                        this.showError = false;
                    }
                    console.log(this.imgSrc);
                });
            }
        };
        img.src = URL.createObjectURL(file);
        this.loaderService.stop();
    }

    onRemoveUpload(event: FileRemoveEvent, form: any) {
        this.item.filename = null;
        form.clear();
        form.uploadedFileCount = 0;
    }

    loadImage() {
        if (this.item && this.item.filename) {
            this.previewFileSerivce
                .postFile({
                    filename: this.item.filename,
                    prefix: this.item.prefix,
                    module: this.item.module
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        this.imgSrc = `data:image/;base64,${entries.base64}`;
                        this.showUpload = false;
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
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();
        if (!!!this.item.generalSkillNameTh || !!!this.item.generalSkillNameEn || !!!this.item.skillFormat) {
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
        // this.skillLevelList = this.levelList.map(({value}) => {
        //     return {
        //         activeFlag:true,
        //         geeralSkillId: this.item.generalSkillId,
        //         skillLevelId: value

        //     }
        // })

        // this.item.skillLevelList = this.item.skillLevelList;
        if (this.mode === 'CREATE') {
            this.masterService.postGeneralSkill(this.item).subscribe((result) => {
                this.loaderService.stop();
                if (result.status === 200) {
                    this.dropdownService
                        .getLookup({
                            displayCode: false,
                            id: LOOKUP_CATALOG.LEVEL
                        })
                        .subscribe(({ status, message, entries }) => {
                            if (status === 200) {
                                this.levelList = entries;
                                if (this.mode === 'CREATE') {
                                    // this.skillLevelList = this.levelList.map(o => {
                                    //     return {
                                    //         tabName: o.nameEn,
                                    //         activeFlag: true,
                                    //         skillLevelId: null,
                                    //         generalSkillId: null,
                                    //         levelNo: o.value,
                                    //         descTh: null,
                                    //         descEn: null,
                                    //         evaluationEvident: null,
                                    //         evaluationCriteria: null,
                                    //     }
                                    // })
                                }
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: this.translate.instant('common.alert.fail'),
                                    detail: message,
                                    life: 2000
                                });
                            }
                        });
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('common.alert.success'),
                        detail: this.translate.instant('common.alert.textSuccess'),
                        life: 2000
                    });
                    console.log(this.item);
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
            this.masterService.putGeneralSkill(this.item.generalSkillId, this.item).subscribe((result) => {
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
            console.log(this.item);
        }
    }

    loadDropDown() {
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.SKILLS_CATEGORIES_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.categorySkillList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });

        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.LEVEL
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.levelList = structuredClone(entries);
                    if (this.mode === 'CREATE') {
                        this.item.skillLevelList = this.levelList.map((o) => {
                            return {
                                tabName: o.nameEn,
                                activeFlag: true,
                                skillLevelId: null,
                                generalSkillId: null,
                                levelNo: o.value,
                                descTh: null,
                                descEn: null,
                                evaluationEvident: null,
                                evaluationCriteria: null
                            };
                        });
                    } else if (this.mode === 'EDIT') {
                        let list: MasGeneralSkillLevelData[] = structuredClone(this.item.skillLevelList);
                        if (this.item.skillLevelList) {
                            if (this.item.skillLevelList.length > 0) {
                                this.item.skillLevelList = list.map((o) => {
                                    const tab: DropdownData = this.levelList.filter(
                                        ({ value }) => value == o.levelNo
                                    )[0] ?? { value: null };
                                    return {
                                        ...o,
                                        tabName: Object.keys(tab).length > 0 ? tab.nameEn : ''
                                    };
                                });
                            } else {
                                this.item.skillLevelList = this.levelList.map((o) => {
                                    return {
                                        tabName: o.nameEn,
                                        activeFlag: true,
                                        levelNo: o.value,
                                        descTh: null,
                                        descEn: null,
                                        evaluationEvident: null,
                                        evaluationCriteria: null
                                    };
                                });
                            }
                        }
                    }
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

    onBack() {
        this.backToListPage.emit('LIST');
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.backToListPage.emit('LIST');
        }
        this.processing = false;
    }

    onCheckImageSize(event: any) {
        var img = event.target;
        if (
            img.naturalWidth < 200 ||
            img.naturalHeight < 200 ||
            img.naturalWidth > 200 ||
            img.naturalHeight > 200
        ) {
            this.isImageSizeValid = false;
        } else {
            this.isImageSizeValid = true;
        }
    }
}
