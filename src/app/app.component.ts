import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig, private translate: TranslateService) {
        translate.addLangs(['en', 'th']);
        translate.setDefaultLang('en');

        const browserLang = translate.getBrowserLang();
        translate.use(browserLang.match(/en|th/) ? browserLang : 'en');
    }

    ngOnInit() {
        this.primengConfig.ripple = true;
    }
}
