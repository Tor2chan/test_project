import { Component } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent {
    version: string;
    constructor(public layoutService: LayoutService) {
        this.version = environment.version
     }
}
