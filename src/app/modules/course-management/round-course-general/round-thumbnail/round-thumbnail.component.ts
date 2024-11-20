
import { Component, DoCheck, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService } from 'primeng/api';
import { DropdownFilterEvent } from 'primeng/dropdown';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, MODE_PAGE } from 'src/app/models/common';
import { CoursepublicMainData, CoursepublicMediaData,CourseMainData } from 'src/app/models/course-management';
import { MasCourseTypeData } from 'src/app/models/master';
import { CourseManagementService } from 'src/app/services/course-management.service';
import { DropdownService } from 'src/app/services/dropdown.service';
import { MasterService } from 'src/app/services/master.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { UploadFileService } from 'src/app/services/upload-file.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-round-thumbnail',
    templateUrl: './round-thumbnail.component.html',
    styleUrls: ['./round-thumbnail.component.scss']
})
export class RoundThumbnailComponent implements OnInit ,DoCheck{

    initForm: boolean = false;
    showError: boolean = false;
    showErrorOverImg: boolean = false;
    isImageSizeValid: boolean = false;

    @Input() coursepublicMain!: CoursepublicMainData;
    @Input() lang: string;

    @Output() afterSaveCourseMain = new EventEmitter();
    @Output() backToList = new EventEmitter();

    mode: MODE_PAGE;

    items: CoursepublicMediaData[] = [];
    totalRecords: number = 0;

    courseMain: CourseMainData;
    masCourseType: MasCourseTypeData;

    processing: boolean = false;
    showUpload: boolean = true;

    coursepublicMedia: CoursepublicMediaData = {};

    courseType: MasCourseTypeData = {};

    // for natthawutl
    imgSrc: string;
    @ViewChild('fileUpload') fileUpload: any;

    constructor(
        public translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private masterService: MasterService,
        private courseManagementService: CourseManagementService,
        private messageService: MessageService,
        private dropdownService: DropdownService,
        private previewFileSerivce: PreviewFileService,
        private uploadFileService: UploadFileService
    ) {
        // this.initForm = true;
    }
    ngDoCheck(): void {
        if (this.coursepublicMain.courseId && !this.initForm) {
            this.initForm = !this.initForm;
            this.loadCourseMain();

        }
    }



    ngOnInit(): void {
        this.initialForm();
    }

    onCheckImageSize(event: any) {
        // var img = event.target;
        // if (img.naturalWidth > 338 || img.naturalHeight > 226) {
        //     this.isImageSizeValid = false;
        // } else {
        //     this.isImageSizeValid = true;
        // }
    }

    loadCourseMain() {
        const courseId = this.coursepublicMain.courseId
        this.courseManagementService.getCourseMain(courseId).subscribe(({ status, message, entries }) => {
            this.initForm = true;
            if (status === 200) {
                this.courseMain = entries;
                this.loadMasCourseType();
            }
        });

    }

    loadMasCourseType() {
        const courseTypeId = this.courseMain.courseTypeId
                this.masterService.getCourseType(courseTypeId).subscribe(({ status, message, entries }) => {
                    this.initForm = true;
                    if (status === 200) {
                        this.masCourseType = entries;
                        this.loadImage();
                    }
                });
    }

    initialForm() {
        if (this.coursepublicMain.coursepublicId) {
            this.mode = 'EDIT';
            this.loaderService.start();
            this.courseManagementService
                .findCoursepublicMedia({
                    coursepublicId: this.coursepublicMain.coursepublicId,
                    /** ภาพปก */
                    mediaType: 30012001,
                    activeFlag: true
                })
                .subscribe(({ status, message, entries }) => {
                    this.loaderService.stop();
                    if (status === 200) {
                        this.coursepublicMedia = entries[0];
                        if (this.coursepublicMedia) {
                            const { prefix, module, filename } = this.coursepublicMedia;
                            if (filename) {
                                this.showUpload = false;
                                this.imgSrc = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
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
        } else {
            this.mode = 'CREATE';
            this.lazyLoadCourseMain(null);
            this.coursepublicMedia = {
                activeFlag: null,
                coursepublicId: null,
                coursepublicMediaId: null,
                first: null,
                filename: null,
                prefix: null,
                module: null,
                mediaNameEn: null,
                mediaNameTh: null,
                mediaType: null,
            };
        }
    }

    onSave() {
        this.processing = true;
        this.loaderService.start();

        if (
            !!!this.coursepublicMedia.mediaNameEn ||
            !!!this.coursepublicMedia.mediaNameTh ||
            !!!this.coursepublicMedia.filename ||
            this.showUpload
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

        if (this.coursepublicMedia.filename) {
            const img = new Image();
            // if (img.naturalWidth > 338 || img.naturalHeight > 226) {
            //     this.showErrorOverImg = true;
            //     this.messageService.add({
            //         severity: 'error',
            //         summary: this.translate.instant('common.alert.fail'),
            //         detail: this.translate.instant('common.alert.overImg'),
            //         life: 2000
            //     });
            //     this.processing = false;
            //     this.loaderService.stop();
            //     console.log("isImageSizeValid1 >>",img.naturalWidth);
            //     console.log("showErrorOverImg1 >>",img.naturalHeight);
            //     return;
            // } else {
                this.processing = true;
                console.log("isImageSizeValid2 >>",img.naturalWidth);
                console.log("showErrorOverImg2 >>",img.naturalHeight);
            // }
        }

        if (this.mode === 'CREATE') {
            this.loaderService.start();

            this.coursepublicMain.mediaNameTh = this.coursepublicMedia.mediaNameTh;
            this.coursepublicMain.mediaNameEn = this.coursepublicMedia.mediaNameEn;
            this.coursepublicMain.filename = this.coursepublicMedia.filename;
            this.coursepublicMain.prefix = this.coursepublicMedia.prefix;
            this.coursepublicMain.module = this.coursepublicMedia.module;

            this.courseManagementService
                .postCoursepublicMain(this.coursepublicMain)
                .subscribe(({ status, message, entries }) => {
                    this.loaderService.stop();
                    this.processing = false;
                    if (status === 200) {
                        localStorage.setItem('coursepublic', '' + entries.coursepublicId);
                        this.mode = 'EDIT';

                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.alert.success'),
                            detail: message,
                            life: 2000
                        });
                        this.afterSaveCourseMain.emit('EDIT');
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: this.translate.instant('common.alert.fail'),
                            detail: message,
                            life: 2000
                        });
                    }
                });

        } else if (this.mode === 'EDIT') {
            this.courseManagementService
                .putCoursepublicMedia(this.coursepublicMedia.coursepublicMediaId, this.coursepublicMedia)
                .subscribe((result) => {
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

        if (!this.isImageSizeValid) {
            this.processing = false;
            this.loaderService.stop();
            return;
        }
    }
    onBack() {
        this.backToList.emit();
    }

    courseMainList: DropdownData[] = [];

    lazyLoadCourseMain(event?: DropdownFilterEvent, pkId?: number) {
        /** หลักสูตรที่ผ่านการอนุมัติแล้ว */
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true,
            id: 30010005
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getCourseMainDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.courseMainList = this.getUniqueListBy([...this.courseMainList, ...entries], 'value');
                // this.courseMainList = entries;
                this.initForm = !this.initForm;

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

    onAdvancedUpload(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        const img = new Image();
        img.onload = () => {
            // if (img.naturalWidth > 338 || img.naturalHeight > 226) {
            //     this.messageService.add({
            //         severity: 'error',
            //         summary: this.translate.instant('common.alert.fail'),
            //         detail: this.translate.instant('common.alert.overImg'),
            //         life: 2000
            //     });
            //     this.showErrorOverImg = true;
            //     return;
            // } else {
                this.uploadFileService.postCoursepublic(file).subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        const { prefix, module, filename } = entries;
                        this.coursepublicMedia.filename = filename;
                        this.coursepublicMedia.prefix = prefix;
                        this.coursepublicMedia.module = module;
                        this.imgSrc = `${environment.apiUrl}/publicfile/${prefix}/${module}/${filename}`;
                        this.showUpload = false;
                    }
                });
            // }

        };
        img.src = URL.createObjectURL(file);
    }

    onRemoveUpload(event: FileRemoveEvent, form: any) {
        this.coursepublicMedia.filename = null;
        form.clear();
        form.uploadedFileCount = 0;
        this.showErrorOverImg = false;
        this.showError = false;
    }

    onEditImage() {
        this.showUpload = true;
    }

    onClose(event: ToastCloseEvent) {
        this.processing = false;
    }

    loadImage() {
        if (this.courseMain.courseId && this.masCourseType.courseTypeId) {
            this.previewFileSerivce
                .postFile({
                    filename: this.masCourseType.filename,
                    prefix: this.masCourseType.prefix,
                    module: this.masCourseType.module
                })
                .subscribe(({ status, message, entries }) => {
                    if (status === 200) {
                        if (this.mode === 'CREATE') {
                            this.imgSrc = `${environment.apiUrl}/publicfile/${this.masCourseType.prefix}/${this.masCourseType.module}/${this.masCourseType.filename}`;
                            // this.imgSrc = `data:image/;base64,${entries.base64}`
                            this.showUpload = false;
                            this.coursepublicMedia.mediaNameEn = this.masCourseType.courseTypeNameEn
                            this.coursepublicMedia.mediaNameTh = this.masCourseType.courseTypeNameTh
                            this.coursepublicMedia.filename = this.masCourseType.filename;
                            this.coursepublicMedia.prefix = this.masCourseType.prefix;
                            this.coursepublicMedia.module = this.masCourseType.module;
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
      }
}
