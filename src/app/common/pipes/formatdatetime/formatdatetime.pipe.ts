import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Injectable()
@Pipe({
    name: 'formatdatetime'
})
export class FormatdatetimePipe implements PipeTransform {
    transform(value: Date, lang: string): any {
        const pad = (n) => (n < 10 ? '0' + n : n);
        if (value) {
            let orgDate = new Date(value);
            const date = orgDate.getDate();
            const month = orgDate.getMonth();
            const year = orgDate.getFullYear();
            const hours = orgDate.getHours();
            const minutes = orgDate.getMinutes();
            if (lang === 'th') {
                return `${pad(date)}/${pad(month + 1)}/${year + 543} ${pad(hours)}:${pad(minutes)}`;
            } else {
                return `${pad(date)}/${pad(month + 1)}/${year} ${pad(hours)}:${pad(minutes)}`;
            }
        } else {
            return '';
        }
    }
}
