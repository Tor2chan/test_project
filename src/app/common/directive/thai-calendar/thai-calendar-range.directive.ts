import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Calendar } from 'primeng/calendar';

@Directive({
    selector: '[appThaiCalendarRange]'
})
export class ThaiCalendarRangeDirective implements OnChanges {
    @Input() lang: string;
    @Input() clickYear: boolean;

    constructor(private calendar: Calendar, private ngControl: NgControl) {
        const ctrl = this.ngControl.control;
        ctrl.valueChanges.subscribe((v) => {
            if (v == null) {
                ctrl.setValue(v, { emitEvent: false });
                return;
            }

            let arrDate: Date[] = structuredClone(v);

            if (this.lang == 'th' && this.clickYear) {
                if (null == arrDate[0] && arrDate[1] == null) {
                    arrDate = null;
                } else if (null == arrDate[1]) {
                    const startDate: Date = arrDate[0];
                    const dd = startDate.getDate();
                    const mm = startDate.getMonth();
                    const yy = startDate.getFullYear();
                    arrDate[0] = new Date(+yy - 543, +mm, +dd);
                    this.calendar.getYear = (...args: any[]) => {
                        return this.calendar.currentYear + 543;
                    };
                }
            }
            ctrl.setValue(arrDate, { emitEvent: false });
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
                    if (this.lang == 'th') {
                        let format = this.calendar.getDateFormat();

                        if (format == 'yy') {
                            format = format.replace(/y+/g, '(\\d+)');
                            const reg = new RegExp(format, 'g');
                            if (_value) {
                                let [valueExec, yearStr] = reg.exec(_value);
                                valueExec = valueExec.replace(yearStr, `${Number(yearStr)}`);
                                value = valueExec;
                            } else {
                                value = _value;
                            }
                            const calendarValue: Date[] = structuredClone(this.calendar.value);
                            if (calendarValue) {
                                if (calendarValue[0] && null === calendarValue[1]) {
                                    calendarValue[0].setFullYear(calendarValue[0].getFullYear() + 543);
                                } else if (calendarValue[0] && calendarValue[1]) {
                                    calendarValue[1].setFullYear(calendarValue[1].getFullYear() + 543);
                                }
                                this.calendar.value = calendarValue;
                            }
                        } else {
                            format = format.replace(/d+/, '\\d+');
                            format = format.replace(/y+/g, '(\\d+)');
                            format = format.replace(/m+/, '\\d+');
                            const reg = new RegExp(format, 'g');
                            if (_value) {
                                let [valueExec, yearStr] = reg.exec(_value);
                                valueExec = valueExec.replace(yearStr, `${Number(yearStr) + 543}`);
                                value = valueExec;
                            } else {
                                value = _value;
                            }
                        }
                    } else {
                        value = _value;
                    }
                },
                get: () => {
                    value = '';
                    let format = this.calendar.getDateFormat();
                    if (format == 'yy') {
                        if (Array.isArray(this.calendar.value)) {
                            let arrDate = structuredClone(this.calendar.value);
                            for (let i = 0; i < arrDate.length; i++) {
                                if (arrDate[i]) {
                                    if (i === 1 && arrDate[1]) value += ' - ';
                                    const getDate = arrDate[i];
                                    const year = getDate.getFullYear();
                                    value += `${year + (this.lang === 'th' ? 543 : 0)}`;
                                }
                            }
                        }
                    } else {
                        if (Array.isArray(this.calendar.value)) {
                            let arrDate = structuredClone(this.calendar.value);
                            for (let i = 0; i < arrDate.length; i++) {
                                if (arrDate[i]) {
                                    if (i === 1 && arrDate[1]) value += ' - ';

                                    const pad = (n) => (n < 10 ? '0' + n : n);
                                    const getDate = arrDate[i];
                                    const date = getDate.getDate();
                                    const month = getDate.getMonth();
                                    const year = getDate.getFullYear();
                                    if (this.lang == 'th') {
                                        value += `${pad(date)}/${pad(month + 1)}/${year + 543}`;
                                    } else {
                                        value += `${pad(date)}/${pad(month + 1)}/${year}`;
                                    }
                                }
                            }
                        }
                    }

                    return value;
                },
                configurable: true
            });
        }
    }
}
