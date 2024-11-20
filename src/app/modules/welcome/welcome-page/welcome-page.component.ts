import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MasterService } from 'src/app/services/master.service';

@Component({
    selector: 'app-welcome-page',
    templateUrl: './welcome-page.component.html',
    styleUrls: ['./welcome-page.component.scss']
})
export class WelcomePageComponent {
    constructor(public translate: TranslateService, private router: Router, private masterService: MasterService) {
        this.masterService.checkLogin().subscribe(({ status }) => {
            if (status !== 200) {
                localStorage.clear();
                localStorage.setItem('lang', 'th');
                this.router.navigate(['/auth/login']);
            }
        });
    }
}
