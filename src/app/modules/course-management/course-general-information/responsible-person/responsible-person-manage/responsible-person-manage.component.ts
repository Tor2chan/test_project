import { CourseManagementService } from './../../../../../services/course-management.service';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { RadioButtonClickEvent } from 'primeng/radiobutton';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { CourseInstructorData } from 'src/app/models/course-management';
import { MasExternalPersonalData } from 'src/app/models/master';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-responsible-person-manage',
    templateUrl: './responsible-person-manage.component.html',
    styleUrls: ['./responsible-person-manage.component.scss']
})
export class ResponsiblePersonManageComponent implements OnInit {
    @Input() item!: CourseInstructorData;

    @Input() mode: MODE_PAGE;

    @Input() lang: string;

    @Output() backToListPage = new EventEmitter();

    processing: boolean = false;
    personalList: DropdownData[] = [];
    showError: boolean = false;

    suggestions: MasExternalPersonalData[] = [];

    @ViewChild('externalNameTh') externalNameTh: AutoComplete;
    @ViewChild('externalNameEn') externalNameEn: AutoComplete;
    @ViewChild('externalEmail') externalEmail: AutoComplete;

    constructor(
        public translate: TranslateService,
        private masterService: MasterService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private dropdownService: DropdownService,
        private courseManagementService: CourseManagementService,
        private previewFileSerivce: PreviewFileService,
        private uploadFileService: UploadFileService
    ) {}
    ngOnInit(): void {
        setTimeout(() => {
            this.lazyLoadPersonal(null, this.item.instructorId);
            this.loadImage();
            const { externalNameTh, externalNameEn, externalEmail } = this.item;
            if (this.externalNameTh && this.externalNameEn && this.externalEmail) {
                this.externalNameTh.inputEL.nativeElement.value = externalNameTh;
                this.externalNameEn.inputEL.nativeElement.value = externalNameEn;
                this.externalEmail.inputEL.nativeElement.value = externalEmail;
            }
        }, 100);
    }

    userImg: string = 'assets/layout/images/dummy/dummy.svg';

    onAdvancedUpload(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        this.uploadFileService.postPersonal(file).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.item.filename = entries.filename;
                this.item.prefix = entries.prefix;
                this.item.module = entries.module;
                const extension = entries.filename.split('.')[1];
                this.userImg = `data:image/${extension};base64,${entries.base64}`;
            }
            console.log(this.userImg);
        });
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
                        this.userImg = `data:image/;base64,${entries.base64}`;
                    } else {
                        console.log('message :>> ', message);
                    }
                });
        }
    }

    onSave() {
        this.loaderService.start();
        console.log(this.item);
        this.processing = true;

        this.loaderService.start();
        if (this.item.instructorType) {
            if (!!!this.item.externalNameTh || !!!this.item.externalNameEn || !!!this.item.externalEmail) {
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
        } else {
            if (!!!this.item.instructorId) {
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
        }

        if (this.mode === 'EDIT') {
            this.courseManagementService
                .putCourseInstructor(this.item.courseInstructorId, this.item)
                .subscribe(({ status, message, entries }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        if (!!!this.item.instructorType) {
                            this.item.instructorType = false;
                        }
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
        } else if (this.mode === 'CREATE') {
            this.item.instructorType = this.item.instructorType ? this.item.instructorType : false;
            this.item.instructorMain = this.item.instructorMain ? this.item.instructorMain : false;
            this.courseManagementService.postCourseInstructor(this.item).subscribe(({ status, message, entries }) => {
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

    lazyLoadPersonal(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: false
        };

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        this.dropdownService.getPersonalDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.personalList = this.getUniqueListBy([...this.personalList, ...entries], 'value');
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

    getUniqueListBy(arr: any[], key) {
        return [...new Map(arr.map((item) => [item[key], item])).values()];
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

    onChangeInstructorType(event: RadioButtonClickEvent) {
        if (event.value) {
            this.item.instructorId = null;
            this.userImg = 'assets/layout/images/dummy/dummy.svg';
        } else {
            this.item.externalNameTh = null;
            this.item.externalNameEn = null;
            this.item.externalEmail = null;
            this.userImg = 'assets/layout/images/dummy/dummy.svg';
        }
    }

    changePersonal() {
        this.masterService.getPersonal(this.item.instructorId).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                const { prefix, module, personalPhotoPath } = entries;
                if (prefix && module && personalPhotoPath) {
                    this.item.prefix = prefix;
                    this.item.module = module;
                    this.item.filename = personalPhotoPath;
                    this.userImg = `${environment.apiUrl}/publicfile/${prefix}/${module}/${personalPhotoPath}`;
                } else {
                    this.item.prefix = prefix;
                    this.item.module = module;
                    this.item.filename = personalPhotoPath;
                    this.userImg = 'assets/layout/images/dummy/dummy.svg';
                }
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

    onKeyupExternal(event?: AutoCompleteCompleteEvent) {
        const criteria: MasExternalPersonalData = {};
        if (event?.query) {
            criteria.searchText = event.query;
        }

        this.masterService.findExternalPersonal(criteria).subscribe(({ status, entries }) => {
            if (status === 200) {
                setTimeout(() => {
                    this.suggestions = entries;
                }, 1500);
            } else {
                this.suggestions = [];
            }
        });
    }

    onSelectedExternal(event: MasExternalPersonalData) {
        const { fullnameTh, fullnameEn, email, filename, prefix, module } = event;
        this.item.externalNameTh = fullnameTh;
        this.item.externalNameEn = fullnameEn;
        this.item.externalEmail = email;
        this.item.filename = filename;
        this.item.prefix = prefix;
        this.item.module = module;

        this.userImg = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
        if (filename == null){
            this.userImg = 'assets/layout/images/dummy/dummy.svg';
        }
        setTimeout(() => {
            this.externalNameTh.inputEL.nativeElement.value = fullnameTh;
            this.externalNameEn.inputEL.nativeElement.value = fullnameEn;
            this.externalEmail.inputEL.nativeElement.value = email;
        }, 100);
    }
}
