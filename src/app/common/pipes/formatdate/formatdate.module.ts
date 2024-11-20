import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormatdatePipe } from './formatdate.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [FormatdatePipe],
    exports: [FormatdatePipe]
})
export class FormatdateModule {}
