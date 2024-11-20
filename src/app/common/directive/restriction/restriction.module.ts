import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestrictionDirective } from './restriction.directive';

@NgModule({
    imports: [CommonModule],
    declarations: [RestrictionDirective],
    exports: [RestrictionDirective]
})
export class RestrictionModule {}
