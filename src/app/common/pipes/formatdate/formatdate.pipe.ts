import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Injectable()
@Pipe({
    name: 'formatdate'
})
export class FormatdatePipe implements PipeTransform {
    transform(value: Date, lang: string): any {
        const pad = (n) => (n < 10 ? '0' + n : n);
        if (value) {
            let orgDate = new Date(value);
            const date = orgDate.getDate();
            const month = orgDate.getMonth();
            const year = orgDate.getFullYear();
            if (lang === 'th') {
                return `${pad(date)}/${pad(month + 1)}/${year + 543}`;
            } else {
                return `${pad(date)}/${pad(month + 1)}/${year}`;
            }
        } else {
            return '';
        }
    }
}
