import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[restriction]'
})
export class RestrictionDirective {
    @Input('restriction') restriction: string;

    private el: ElementRef;

    constructor(el: ElementRef) {
        this.el = el;
    }

    @HostListener('keypress', ['$event'])
    handleKeyPress(event: KeyboardEvent) {
        var regex = new RegExp(this.restriction);
        var str = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (regex.test(str)) {
            return true;
        }

        event.preventDefault();
        return false;
    }
}
