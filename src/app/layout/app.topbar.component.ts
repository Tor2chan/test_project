import { Component, DoCheck, ElementRef, ViewChild } from '@angular/core';
import { MegaMenuItem, PrimeNGConfig } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { TranslateService } from '@ngx-translate/core';
import { MegaMenu } from 'primeng/megamenu';
import { AllMenu } from '../models/login';
import { LoginService } from 'src/app/services/login.service';
import { Router } from '@angular/router';
import { AutUserData } from '../models/user-management';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements DoCheck {
    items: MegaMenuItem[] = [];
    childMenu: MegaMenuItem = {};
    showMainMenu: boolean = true;

    lang: string;
    fullname: string;

    @ViewChild('menubutton') menuButton!: ElementRef;

    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

    @ViewChild('topbarmenu') menu!: ElementRef;

    constructor(
        public layoutService: LayoutService,
        private config: PrimeNGConfig,
        private translate: TranslateService,
        private loginService: LoginService,
        private router: Router
    ) {
        this.translate.addLangs(['en', 'th']);
        let lang = localStorage.getItem('lang');
        if (!!!lang) {
            localStorage.setItem('lang', 'th');
            lang = localStorage.getItem('lang');
        }
        this.lang = lang.toUpperCase();
        this.translate.currentLang = lang;
        this.translate.setDefaultLang(lang);
        this.translate.use(lang.match(/en|th/) ? lang : 'th');
        this.translate.get('primeng').subscribe((res) => this.config.setTranslation(res));
        this.items = this.getMenu();
    }
    ngDoCheck(): void {
        if (!this.layoutService.state.profileSidebarVisible) {
            this.showMainMenu = true;
            this.backDrop();
        }
    }

    switchLanguage() {
        const lang = this.translate.currentLang === 'en' ? 'th' : 'en';
        this.lang = lang.toUpperCase();
        localStorage.setItem('lang', lang);
        this.translate.currentLang = lang;
        this.translate.setDefaultLang(lang);
        this.translate.use(lang);
        this.translate.get('primeng').subscribe((res) => this.config.setTranslation(res));
        this.items = this.getMenu();
    }

    backDrop() {
        const data = document.querySelector(
            'p-megamenu > div > ul > li.p-element.p-menuitem.ng-star-inserted.p-menuitem-active'
        );
        if (data || this.layoutService.state.profileSidebarVisible) {
            document.querySelector('.layout-main').classList.add('layout-main-inactive');
        } else {
            document.querySelector('.layout-main').classList.remove('layout-main-inactive');
        }
    }

    getMenu(): MegaMenu[] {
        let data: MegaMenu[] = JSON.parse(localStorage.getItem('allMenu')) ?? [];
        if (data.length == 0) return [];
        return this.transformData(JSON.parse(localStorage.getItem('allMenu')));
    }

    transformData(data: AllMenu[]): MegaMenu[] {
        const transformedData = [];
        const tempMap = {};

        (data || []).forEach((item) => {
            tempMap[item.menuId] = {
                label: item.showNameKey ? this.translate.instant(item.showNameKey) : item.name,
                routerLink: item.link
            };
            if (item.parentId === 0) {
                transformedData.push(tempMap[item.menuId]);
            } else {
                if (tempMap[item.parentId]) {
                    if (!('items' in tempMap[item.parentId])) {
                        tempMap[item.parentId].items = [];
                    }
                    if (item?.link) {
                        tempMap[item.parentId].items.push(tempMap[item.menuId]);
                    } else {
                        tempMap[item.parentId].items.push([tempMap[item.menuId]]);
                    }
                }
            }
        });

        const user: AutUserData = JSON.parse(localStorage.getItem('user')) ?? {};
        if (this.lang === 'TH') {
            const { firstnameTh, lastnameTh } = user;
            this.fullname = `${firstnameTh} ${lastnameTh}`;
        } else {
            const { firstnameEn, lastnameEn } = user;
            this.fullname = `${firstnameEn} ${lastnameEn}`;
        }

        return transformedData;
    }

    logout() {
        localStorage.clear();
        localStorage.setItem('lang', 'th');
        this.router.navigate(['/auth/login']);
        window.location.reload();
    }

    clickMainMenu(child: MegaMenuItem) {
        this.showMainMenu = false;
        this.childMenu = child;
    }

}
