import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { AllMenu } from 'src/app/models/login';

@Directive({
    selector: '[permission]'
})
export class PermissionDirective implements OnInit {
    @Input() menuCode: string;

    menuAction: AllMenu[] = [];

    constructor(private el: ElementRef) {
        const data: AllMenu[] = JSON.parse(localStorage.getItem('allMenu')) ?? [];
        if (data.length > 0) {
            this.menuAction = data;
            // this.menuAction = data.filter((o) => o.menuType === 'A');
        }
    }

    ngOnInit(): void {
        const menuList: string[] = this.menuCode.split(",").map(menu => menu.trim());
        const data = this.menuAction.filter((o) => menuList.includes(o.menuCode));
        if (data.length > 0) {
            const { activeFlag } = data[0];
            if (activeFlag) {
                return;
            }
        }
        this.el.nativeElement.remove();
        // this.el.nativeElement.style.display = 'none';
    }
}
