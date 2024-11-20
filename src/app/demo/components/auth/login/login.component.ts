import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'src/app/services/login.service';
import { AllMenu, LoginFormData } from 'src/app/models/login';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastCloseEvent } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
    valCheck: string[] = ['remember'];

    loginForm: LoginFormData = {
        username: null,
        password: null
    };

    processing: boolean = false;

    version: string = environment.version;

    constructor(
        public layoutService: LayoutService,
        private loginService: LoginService,
        private router: Router,
        private translate: TranslateService,
        private loaderService: NgxUiLoaderService,
        private messageService: MessageService
    ) {
        translate.addLangs(['en', 'th']);
        translate.setDefaultLang('th');

        let browserLang = localStorage.getItem('lang');
        if (!!!browserLang) {
            localStorage.setItem('lang', 'th');
            browserLang = localStorage.getItem('lang');
        }
        translate.use(browserLang.match(/en|th/) ? browserLang : 'th');
    }

    menu: AllMenu[]

    onLogin() {
        this.loaderService.start();
        this.processing = true;
        this.loginService.login(this.loginForm).subscribe(({ status, message, entries }) => {
            this.loaderService.stop();
            if (status == 200) {

                this.menu = entries.allMenu;

                localStorage.setItem('user', JSON.stringify(entries.user));
                localStorage.setItem('allMenu', JSON.stringify(entries.allMenu));

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
                    detail: this.translate.instant(message),
                    life: 2000
                });
            }
        });
    }

    switchLanguage() {
        const lang = this.translate.currentLang === 'en' ? 'th' : 'en';
        localStorage.setItem('lang', lang);
        this.translate.use(lang);
    }

    onClose(event: ToastCloseEvent) {
        if (event.message.severity === 'success') {
            this.router.navigate(['/']);
        }
        this.processing = false;
    }

}
