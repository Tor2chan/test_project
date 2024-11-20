import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AllMenu } from '../models/login';
import { MasterService } from '../services/master.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private masterService: MasterService) {}

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        this.masterService.checkLogin().subscribe(({ status }) => {
            if (status !== 200) {
                localStorage.clear();
                localStorage.setItem('lang', 'th');
                this.router.navigate(['/auth/login']);
            }
        });
        const allMenu: AllMenu[] = JSON.parse(localStorage.getItem('allMenu'));
        const canActive = (allMenu || []).filter(({ link }) => state.url === link).length === 1;

        // if (canActive) {
        //     return canActive;
        // } else {
        //     this.router.navigate(['/auth/access']);
        //     return canActive;
        // }
        return true;
    }
}
