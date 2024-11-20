import { Directive, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { NgModel } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { MasExternalPersonalData } from 'src/app/models/master';

@Directive({
    selector: '[autoCompleteOptionValue]'
})
export class AutocompleteOptionValueDirective {
    @Input() optionValue: string;
    @Output() callBackDirective = new EventEmitter();

    constructor(private ngModel: NgModel) {}

    @HostListener('onSelect', ['$event'])
    onSelect(event: MasExternalPersonalData) {
        if (event) {
            const ctrl = this.ngModel.valueAccessor as AutoComplete;
            ctrl.value = event.fullnameTh;
            this.ngModel.update.emit(event.fullnameTh);
            setTimeout(() => {
                this.callBackDirective.emit(event);
            }, 50);
        }
    }
}
