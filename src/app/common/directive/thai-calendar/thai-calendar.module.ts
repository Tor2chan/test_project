import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThaiCalendarDirective } from './thai-calendar.directive';
import { ThaiCalendarRangeDirective } from './thai-calendar-range.directive';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [ThaiCalendarDirective, ThaiCalendarRangeDirective],
  exports:[ThaiCalendarDirective, ThaiCalendarRangeDirective]
})
export class ThaiCalendarModule { }
