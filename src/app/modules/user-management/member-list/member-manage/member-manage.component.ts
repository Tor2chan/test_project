import { UploadFileService } from 'src/app/services/upload-file.service';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { MessageService, MenuItem, ConfirmationService } from 'primeng/api';
import { DropdownChangeEvent, DropdownFilterEvent } from 'primeng/dropdown';
import { FileRemoveEvent, FileUploadHandlerEvent } from 'primeng/fileupload';
import { ToastCloseEvent } from 'primeng/toast';
import { DropdownCriteriaData, DropdownData, DropdownTambonData, LOOKUP_CATALOG, MODE_PAGE } from 'src/app/models/common';
import { MemberInfoData } from 'src/app/models/user-management';
import { DropdownService } from 'src/app/services/dropdown.service';
import { UserManagementService } from 'src/app/services/user-management.service';

@Component({
    selector: 'app-member-manage',
    templateUrl: './member-manage.component.html',
    styleUrls: ['./member-manage.component.scss']
})
export class MemberManageComponent implements OnInit, AfterViewInit {
    @Input() item!: MemberInfoData;

    @Input() mode: MODE_PAGE = 'EDIT';

    @Input() lang: string = 'th';
    accessLevelList: DropdownData[] = [];
    roleList: DropdownData[] = [];
    @Output() backToListPage = new EventEmitter();

    initForm: boolean = false;
    processing: boolean = false;
    visible: boolean = false;
    dubleChecks: boolean = false;
    
    clickMemberBirthdate: boolean = false;

    genderList: DropdownData[] = [];
    memberChannelList: DropdownData[] = [];
    memberCountryTypeList: DropdownData[] = [];
    highestEducationalList: DropdownData[] = [];
    currentJobList: DropdownData[] = [];
    // addressTypeList: DropdownData[] = [];

    countryList: DropdownData[] = [];
    prefixnameList: DropdownData[] = [];

    provinceList: DropdownData[] = [];
    amphurList: DropdownData[] = [];
    tambonList: DropdownTambonData[] = [];

    user: MenuItem;
    member: MenuItem;
    editUsernameText: string;

    @ViewChild('fileUpload') fileUpload: any;

    constructor(
        public translate: TranslateService,
        private dropdownService: DropdownService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private userManagementService: UserManagementService,
        private previewFileSerivce: PreviewFileService,
        private uploadFileService: UploadFileService,
        private confirmationService: ConfirmationService
    ) {
        this.user = {
            label: this.translate.instant('common.module.user'),
            command: () => this.openPage('LIST')
        }

        this.member = {
            label: this.translate.instant('userManagement.member.name'),
            command: () => this.openPage('LIST')
        }
    }

    openPage(page: MODE_PAGE) {
        this.backToListPage.emit('LIST');
    }

    ngAfterViewInit(): void {
        this.loadDropDown();
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.initForm = true;
            window.scrollTo(0, 0);
        }, 200);
    }

    userImg: string = 'assets/layout/images/dummy/dummy.svg';

      onAdvancedUpload(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        this.uploadFileService.postMember(file)
        .subscribe(({status, message, entries}) => {
            if (status === 200) {
                this.item.filename = entries.filename;
                this.item.prefix = entries.prefix;
                this.item.module = entries.module;
                const extension = entries.filename.split('.')[1]
                this.userImg = `data:image/${extension};base64,${entries.base64}`
            }
            console.log(this.userImg)
        })
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
                        this.userImg = `data:image/;base64,${entries.base64}`
                    }
                });
        }
      }

    loadDropDown() {
        this.loadImage();
        const { countryId, prefixnameId, memberAdderss } = structuredClone(this.item);

            this.lazyLoadCountry(null, countryId);
        this.lazyLoadPrefixname(null, prefixnameId);
        this.lazyLoadProvince(null, memberAdderss.addressProvince);
        this.lazyLoadAmphur(null, memberAdderss.addressAmphur);
        this.lazyLoadTambon(null, memberAdderss.addressTambon);

        /*
        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.ADDRESS_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.addressTypeList = entries;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.alert.fail'),
                        detail: message,
                        life: 2000
                    });
                }
            });
        */

        this.dropdownService
            .getLookup({
                displayCode: false,
                id: LOOKUP_CATALOG.HIGHEST_EDUCATIONAL_QUALIFICATION
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.highestEducationalList = entries;
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
                id: LOOKUP_CATALOG.NATIONAL_TYPE
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.memberCountryTypeList = entries;
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
                id: LOOKUP_CATALOG.ACCOUNT_FORMAT
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.memberChannelList = entries;
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
                id: LOOKUP_CATALOG.GENDER
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.genderList = entries;
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
                id: LOOKUP_CATALOG.CURRENT_JOB_STATUS
            })
            .subscribe(({ status, message, entries }) => {
                if (status === 200) {
                    this.currentJobList = entries;
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

    lazyLoadCountry(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getCountryDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.countryList = entries;
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

    lazyLoadPrefixname(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: true
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getPrefixnameDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.prefixnameList = entries;
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

    lazyLoadProvince(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            displayCode: false
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getProvinceDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.provinceList = entries;
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

    lazyLoadAmphur(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            id: this.item?.memberAdderss?.addressProvince,
            displayCode: false
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getAmphurDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.amphurList = entries;
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

    lazyLoadTambon(event?: DropdownFilterEvent, pkId?: number) {
        let dropdownCriteriaData: DropdownCriteriaData = {
            id: this.item?.memberAdderss?.addressAmphur,
            displayCode: false
        };

        if (pkId) {
            dropdownCriteriaData.pkId = pkId;
        }

        if (event && event.filter) {
            dropdownCriteriaData.searchValue = event.filter;
        }

        this.dropdownService.getTambonDropdown(dropdownCriteriaData).subscribe(({ status, message, entries }) => {
            if (status === 200) {
                this.tambonList = entries;
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

        // validate
        if (this.mode === 'EDIT') {
            this.confirm();
            if (!this.dubleChecks) {
                this.processing = true;
                this.loaderService.start();
                this.userManagementService
                .putMemberInfo(this.item.memberId, this.item)
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
            }

        }
    }

    onBack() {
        this.backToListPage.emit('LIST');
    }

    changeMemberCountryType(memberCountryType: number) {
        if (memberCountryType === 30028001) {
            /** TH = 221 */
            this.item.countryId = 221;
            this.lazyLoadCountry(null, 221);
        } else {
            this.lazyLoadCountry();
        }
    }

    changeTambon(event: DropdownChangeEvent) {
        if (event.value && this.item.memberAdderss) {
            this.item.memberAdderss.addressZipcode = this.tambonList.filter(({ value }) => value == event.value)[0]?.zipCode
        }
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.onBack();
        }
        this.processing = false;
    }

    editUsername(item: any) {
        if ( !this.visible ) {
            this.visible = true;
        } else {
            this.dubleChecks = true;
            this.visible = false;
        this.item.memberEmail = item;
        this.item.username = item;
        }
    }

    confirm() {
        if (this.dubleChecks) {
            this.confirmationService.confirm({
                header: this.translate.instant('userManagement.member.form.confirm'),
                message: this.translate.instant('userManagement.member.form.confirmDetail'),
                acceptLabel: this.translate.instant('common.button.save'),
                rejectLabel: this.translate.instant('common.button.cancel'),
                accept: () => {
                    this.dubleChecks = false;
                    this.onSave();

                },
                reject: () => {

                }
            });
        }

    }
}
