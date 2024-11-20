import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Calendar } from 'primeng/calendar';

@Directive({
    selector: '[appThaiCalendar]'
})
export class ThaiCalendarDirective implements OnChanges {
    @Input() lang: string;
    @Input() clickYear: boolean;

    constructor(private calendar: Calendar, private ngControl: NgControl) {
        const ctrl = this.ngControl.control;
        ctrl.valueChanges.subscribe((v) => {

            let format = this.calendar.getDateFormat();

            let actual = structuredClone(v);
            if (((this.clickYear && this.lang == 'th') || (format == 'yy' && this.lang == 'th')) && !!actual) {
                const dd = actual.getDate();
                const mm = actual.getMonth();
                const yy = actual.getFullYear() - 543;
                actual = new Date(+yy - 0, +mm, +dd);
                this.calendar.getYear = (...args: any[]) => {
                    return this.calendar.currentYear + 543;
                };
            }
            ctrl.setValue(actual, { emitEvent: false });
        });
    }

    yearsList() {
        let yearPickerValues = [];
        const currentYear = this.calendar.currentYear + (this.clickYear ? 0 : this.lang === 'th' ? 543 : 0);
        let base = currentYear - (currentYear % 10);
        for (let i = 0; i < 10; i++) {
            yearPickerValues.push(base + i);
        }
        return yearPickerValues;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['lang'] || changes['clickYear']) {
            this.lang = changes['lang'] ? changes['lang'].currentValue : this.lang;

            this.calendar.yearPickerValues = (...args: any[]) => {
                return this.yearsList();
            };

            this.calendar.getYear = (...args: any[]) => {
                if (this.clickYear && this.lang === 'th') {
                    return this.calendar.currentYear;
                }
                return this.calendar.currentYear + (this.lang === 'th' ? 543 : 0);
            };

            let value: string;
            Object.defineProperty(this.calendar, 'inputFieldValue', {
                set: (_value: string) => {
                    // set value
                    if (this.lang == 'th') {
                        let format = this.calendar.getDateFormat();
                        if (format == 'yy') {
                            format = format.replace(/y+/g, '(\\d+)');
                            const reg = new RegExp(format, 'g');
                            if (_value) {
                                let [valueExec, yearStr] = reg.exec(_value);
                                valueExec = valueExec.replace(yearStr, `${Number(yearStr) + 543}`);
                                value = valueExec;
                            } else {
                                value = _value;
                            }
                        } else {
                            if (_value) {
                                const pad = (n) => (n < 10 ? '0' + n : n);
                                let [day, month, year] = _value.split('/');
                                let getDate = null;
                                let hours = null;
                                let minutes = null;
                                if (this.calendar._showTime) {
                                    let newYear = year.split(/\s+/)[0];
                                    [hours,  minutes] = year.split(/\s+/)[1].split(":");
                                    year = newYear;
                                }
                                getDate = this.calendar._showTime ? new Date(+year - 0, +month - 1, +day, hours, minutes)  : new Date(+year - 0, +month - 1, +day);
                                this.calendar.value = getDate;
                                const dd = getDate.getDate();
                                const mm = getDate.getMonth();
                                const yy = getDate.getFullYear() + 543;
                                value = `${pad(dd)}/${pad(mm + 1)}/${yy}`;
                            } else {
                                value = _value;
                            }
                        }
                    }
                },
                get: () => {
                    // show
                    const format = this.calendar.getDateFormat();
                    if ('yy' == format) {
                        const getDate = this.calendar.value ? new Date(this.calendar.value) : null;
                        if (getDate) {
                            const year = getDate.getFullYear();
                            if (this.lang == 'th') {
                                value = `${year + 543}`;
                            } else {
                                value = `${year}`;
                            }
                        }
                    } else {
                        const pad = (n) => (n < 10 ? '0' + n : n);
                        const getDate = this.calendar.value ? new Date(this.calendar.value) : null;
                        if (getDate) {
                            const date = getDate.getDate();
                            const month = getDate.getMonth();
                            const year = getDate.getFullYear();
                            const hour = getDate.getHours();
                            const minute = getDate.getMinutes()

                            if (this.lang == 'th') {
                                value = `${pad(date)}/${pad(month + 1)}/${year + 543}`;
                            } else {
                                value = `${pad(date)}/${pad(month + 1)}/${year}`;
                            }
                            if (this.calendar._showTime) {
                                value += ` ${pad(hour)}:${pad(minute)}`
                            }
                        }
                    }
                    return value ?? '';
                },
                configurable: true
            });
        }
    }
}
