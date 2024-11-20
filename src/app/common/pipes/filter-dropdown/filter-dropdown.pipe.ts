import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { DropdownData } from 'src/app/models/common';

const DEFAULT_IF_NULL = '';

@Injectable()
@Pipe({
    name: 'filterdropdown'
})
export class FilterDropdownPipe implements PipeTransform {
    transform(items: DropdownData[], valueOfItems: number | null, lang: string, ifnull?: string): any {
        if (!valueOfItems || (items || []).length === 0) return ifnull ? DEFAULT_IF_NULL : ifnull;
        const item: DropdownData = items.filter(({ value }) => value == valueOfItems)[0];
        if (!item) return ifnull ? DEFAULT_IF_NULL : ifnull;
        return lang == 'th' ? item.nameTh : item.nameEn;
    }
}
