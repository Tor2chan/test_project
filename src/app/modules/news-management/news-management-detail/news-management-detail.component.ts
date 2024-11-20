import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, DoCheck } from '@angular/core';
import { MODE_PAGE } from 'src/app/models/common';
import { NewsManagementService } from 'src/app/services/news-management.service';
import { MessageService, MenuItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { TablePageEvent } from 'primeng/table';
import { NewsInfoData } from 'src/app/models/news-management/NewsInfoData';
import { NewsInfoAttachData } from 'src/app/models/news-management/NewsInfoAttachData';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PreviewFileService } from 'src/app/services/preview-file.service';
import { GlobalService } from 'src/app/services/global-service.service';
@Component({
    selector: 'app-news-management-detail',
    templateUrl: './news-management-detail.component.html',
    styleUrls: ['./news-management-detail.component.scss']
})
export class NewsManagementDetailComponent implements OnInit, DoCheck{
    lang: string;
    @Input() mode: MODE_PAGE = 'VIEW';
    @Output() goBack = new EventEmitter();
    newsInfo: any;
    filesList: any[] = [];
    totalRecords: number = 0;
    coverImageFile:any;

    @Input() item!: NewsInfoData;
    items: NewsInfoAttachData[] = [];

    showUpload: boolean = true;
    imgSrc: string;

    imageStyle: any = {
        'max-width': '670px',
        'max-height': '420px',
        'image-resolution': '300dpi',
        'object-fit': 'contain'
      };

      news_information: MenuItem;

    constructor(
        private newsManagementService: NewsManagementService,
        public translate: TranslateService,
        private messageService: MessageService,
        private loaderService: NgxUiLoaderService,
        private previewFileSerivce: PreviewFileService,
        private renderer: Renderer2,
        private el: ElementRef,
        private globalService: GlobalService
    ) { this.setItems() }

    setItems() {
        this.news_information = {
        label: this.translate.instant('newsManagement.newsInformation'),
        command: () => this.openPage('LIST')
        };
    }

    openPage(page: MODE_PAGE) {
        this.goBack.emit('LIST');
    }

    

    ngDoCheck(): void {
        if (this.lang != localStorage.getItem('lang')) {
            this.lang = localStorage.getItem('lang');
            this.setItems();
        }
    }

    ngOnInit(): void {
        // setTimeout(() => {
        //     window.scrollTo(0, 0);
        // }, 100);
        this.fetchTable();
        this.loadImage();
        this.getData();
        this.setItems();
    }

    fetchTable(event?: TablePageEvent) {
        this.loaderService.start();
        const criteria: NewsInfoAttachData = {
            newsId: this.item.newsId,
            activeFlag: true,
            first: 0,
            size: 5
        };

        if (event) {
            criteria.size = event.rows;
            criteria.first = event.first;
        }

        if (this.item.newsId) {
            this.newsManagementService
                .findNewsInfoAttach(criteria) // รอ
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
                this.loadImage();
        } else {
            this.loaderService.stop();
        }
    }



    // render propoty HTML
    async getData() {
        const response = await this.item.newsDetail;
        const data = response;
        const content = this.el.nativeElement.querySelector('#content');

        const node = this.renderer.createElement('div');
        this.renderer.setProperty(node, 'innerHTML', data);
        this.renderer.appendChild(content, node);
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
                        this.showUpload = false;
                        this.imgSrc = `data:image/;base64,${entries.base64}`;
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
    onBack() {
        this.goBack.emit('LIST');
    }



    previewFile(event: NewsInfoAttachData): void {
        console.log("event:",event)
        this.loaderService.start();
        this.previewFileSerivce
            .postFile({
                filename: event.filename,
                prefix: event.prefix,
                module: event.module
            })
            .subscribe(({ status, message, entries }) => {
                this.loaderService.stop();
                if (status === 200) {
                    const base64ToArrayBuffer = (data) => {
                        const bString = window.atob(data);
                        const bLength = bString.length;
                        const bytes = new Uint8Array(bLength);
                        for (let i = 0; i < bLength; i++) {
                            bytes[i] = bString.charCodeAt(i);
                        }
                        return bytes;
                    };

                    // const filename = this.lang === 'th' ? event.fileNameTh : event.fileNameEn
                    const bufferArray = base64ToArrayBuffer(entries.base64);
                    const blobStore = new Blob([bufferArray], { type: 'application/pdf' });
                    const data = window.URL.createObjectURL(blobStore);
                    this.globalService.openTargetBlank(data);
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
