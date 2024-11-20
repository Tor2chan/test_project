import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterDropdownPipe } from './filter-dropdown.pipe';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [FilterDropdownPipe],
  exports:[FilterDropdownPipe]
})
export class FilterDropdownModule { }
