import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThaiCalendarModule } from './thai-calendar/thai-calendar.module';
import { PermissionModule } from './permission/permission.module';
import { RestrictionModule } from './restriction/restriction.module';
import { AutoCompleteOptionValueModule } from './auto-complete-option-value/auto-complete-option-value.module';

@NgModule({
    imports: [AutoCompleteOptionValueModule, CommonModule, ThaiCalendarModule, PermissionModule, RestrictionModule],
    exports: [AutoCompleteOptionValueModule, ThaiCalendarModule, PermissionModule, RestrictionModule]
})
export class DirectiveModule {}
