import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteOptionValueDirective } from './auto-complete-option-value.directive';

@NgModule({
    imports: [CommonModule],
    declarations: [AutocompleteOptionValueDirective],
    exports: [AutocompleteOptionValueDirective]
})
export class AutoCompleteOptionValueModule {}
