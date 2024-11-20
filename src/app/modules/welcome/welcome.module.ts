import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { WelcomePageComponent } from './welcome-page/welcome-page.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from 'src/app/common/directive/directive.module';
import { PipeModule } from 'src/app/common/pipes/pipe.module';

@NgModule({
    declarations: [WelcomePageComponent],
    imports: [CommonModule, WelcomeRoutingModule, FormsModule, TranslateModule, DirectiveModule, PipeModule]
})
export class WelcomeModule {}
