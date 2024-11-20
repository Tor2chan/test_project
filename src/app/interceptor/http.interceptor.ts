import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpResponse,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private _isoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+\d{2}:\d{2}$/;

    constructor(private router: Router) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Add authorization header
        const lang = localStorage.getItem('lang');
        const token = localStorage.getItem('token');
        if (!request.url.includes('/login') && token && lang) {
            request = request.clone({
                setHeaders: {
                    Authorization: `${token}`,
                    lang: lang
                }
            });
        }

        // Continue with the request and intercept the response
        return next.handle(request).pipe(
            tap({
                next: (event) => {
                    if (event instanceof HttpResponse && (event.status === 200 || event.status === 201)) {
                        const newToken = event.headers.get('Authorization');

                        this.convert(event.body?.entries);

                        if (newToken) {
                            localStorage.setItem('token', newToken);
                        }
                        if (event.url.includes('authentication')) {
                            const newToken = event.body?.entries?.token;

                            localStorage.setItem('token', `Bearer ${newToken}`);
                        }
                    }
                },
                error: (err) => {
                    if (
                        err instanceof HttpErrorResponse &&
                        (err.status === 404 || err.status === 401 || err.status >= 500)
                    ) {
                        localStorage.clear();
                        localStorage.setItem('lang', 'th');
                        this.router.navigate(['/auth/login']);
                        setTimeout(() => {
                            window.location.reload();
                        }, 200);
                    }
                }
            })
        );
    }

    isIsoDateString(value: any): boolean {
        if (value === null || value === undefined) {
            return false;
        }
        if (typeof value === 'string') {
            return this._isoDateFormat.test(value);
        }
        return false;
    }
    convert(body: any) {
        if (body === null || body === undefined) {
            return body;
        }
        if (typeof body !== 'object') {
            return body;
        }
        for (const key of Object.keys(body)) {
            const value = body[key];
            if (this.isIsoDateString(value)) {
                body[key] = new Date(value);
            } else if (typeof value === 'object') {
                this.convert(value);
            }
        }
    }
}
