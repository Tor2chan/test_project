import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CoursepublicMainData } from 'src/app/models/course-management';
import { MasPersonalData } from 'src/app/models/master';

export interface CardListChip {
    text: string;
    icon?: string;
}
export interface CardListMenu {
    text: string;
    icon?: string;
    callBackData?: CallBackData;
    display: boolean;
    menuCode: string;
}

export interface CallBackData {
    eventName?: string;
    data?: any;
}

export interface CardTitleStatus {
    text: string;
    callBackData?: CallBackData;
}
@Component({
    selector: 'app-card-list-common',
    templateUrl: './card-list-common.component.html',
    styleUrls: ['./card-list-common.component.scss']
})
export class CardListCommonComponent {

    constructor(public translate: TranslateService) {}

    @Input() title: string;
    @Input() titleStatus: CardTitleStatus;
    @Input() titleStatusColor: string = 'coral';
    @Input() masPersonalData: MasPersonalData;
    @Input() courseInfo:CoursepublicMainData;
    @Input() detail: string;
    @Input() chipList: CardListChip[];
    @Input() person: CardListChip[];
    @Input() menuList: CardListMenu[];
    @Input() imgUrl: string;
    @Input() imgFlag: boolean;
    @Input() lang: string;

    @Output() callBack = new EventEmitter();

    clickCallBack<T>(event: T) {
        console.log('event :>> ', event);
        this.callBack.emit(event);
    }

    filterDisplay(menuList: CardListMenu[]): CardListMenu[] {
        if (menuList && menuList.length === 0) {
            return [];
        }
        return menuList.filter(({ display }) => display);
    }

    //---Exam Data---
    // title:string="DLLS01 - Listening and Speaking Japanese.."
    // titleStatus:string="รอส่ง"
    // detail:string="ข้อมูลหลักสูตรศิลปศาสตรบัณฑิต สาขาวิชาภาษาตะวันออก · 1) มีทักษะการสื่อสารภาษาจีน ญ่ีปุ่น หรือเกาหลีอย่างมีประสิทธิภาพ และมีความเข้าใจบริบทสังคมและวัฒนธรรม · 2) มีความใฝ่รู้และนำความรู้ทาง"
    // chipList =[
    //   {text:"วันที่ขออนุมัติ",icon:"pi pi-home"},
    //   {text:"Offline",icon:""},
    //   {text:"เทียบเคียงหลักสูตร",icon:""},
    //   {text:"ผู้ช่วยศาตราจารย์",icon:""},

    // ]
    // menuList =[
    //   {text:"รายละเอียด",icon:"pi pi-search",link:"https://angular.io/tutorial/first-app/first-app-lesson-08"},
    //   {text:"แก้ไขข้อมูล",icon:"pi pi-pencil",link:""},
    //   {text:"คัดลอกข้อมูล",icon:"pi pi-home",link:""},
    //   {text:"เอกสารการขออนุมัติ",icon:"pi pi-home",link:""},

    // ]
    // imgUrl="https://www.swu.ac.th/images/swu_logo_v3.png"
    //imgFlag = true;

    //---Exam Component---
    //   <app-card-list-common
    //     [title]="title"
    //     [titleStatus]="titleStatus"
    //     [detail]="detail"
    //     [chipList]="chipList"
    //     [menuList]="menuList"
    //     [imgUrl]="imgUrl"
    //     [imgFlag]="imgFlag">
    // </app-card-list-common>
}
