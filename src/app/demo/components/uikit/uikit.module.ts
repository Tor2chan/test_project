import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UIkitRoutingModule } from './uikit-routing.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	imports: [
		CommonModule,
		UIkitRoutingModule,
        TranslateModule
	]
})
export class UIkitModule { }
