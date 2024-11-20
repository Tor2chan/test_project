import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SortModule } from './sort/sort.module';
import { FilterDropdownModule } from './filter-dropdown/filter-dropdown.module';
import { FormatdateModule } from './formatdate/formatdate.module';
import { FormatdatetimeModule } from './formatdatetime/formatdatetime.module';
import { SafeModule } from './safe/safe.module';

@NgModule({
    imports: [CommonModule, SortModule, FormatdateModule, FormatdatetimeModule, SafeModule],
    exports: [SortModule, FormatdateModule, FormatdatetimeModule, FilterDropdownModule, SafeModule]
})
export class PipeModule {}
