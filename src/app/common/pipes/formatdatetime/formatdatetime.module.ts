import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatdatetimePipe } from './formatdatetime.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [FormatdatetimePipe],
    exports: [FormatdatetimePipe]
})
export class FormatdatetimeModule {}
