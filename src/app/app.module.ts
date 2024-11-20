import { NgModule } from '@angular/core';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { ProductService } from './demo/service/product.service';
import { CountryService } from './demo/service/country.service';
import { CustomerService } from './demo/service/customer.service';
import { EventService } from './demo/service/event.service';
import { IconService } from './demo/service/icon.service';
import { NodeService } from './demo/service/node.service';
import { PhotoService } from './demo/service/photo.service';
import { AuthGuard } from './guard/auth.guard';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { AuthInterceptor } from './interceptor/http.interceptor';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxUiLoaderConfig, NgxUiLoaderModule } from 'ngx-ui-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { GlobalService } from './services/global-service.service';

export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient);
}

const configLoading: NgxUiLoaderConfig = {
    bgsColor: '#da2129',
    bgsOpacity: 0.5,
    bgsPosition: 'bottom-right',
    bgsSize: 60,
    bgsType: 'ball-spin-clockwise',
    blur: 5,
    delay: 0,
    fastFadeOut: true,
    fgsColor: '#da2129',
    fgsPosition: 'center-center',
    fgsSize: 90,
    fgsType: 'three-strings',
    gap: 24,
    logoPosition: 'center-center',
    logoSize: 120,
    // logoUrl: 'https://upload.wikimedia.org/wikipedia/th/thumb/a/ac/Srinakharinwirot_University_Logo.svg/800px-Srinakharinwirot_University_Logo.svg.png',
    masterLoaderId: 'master',
    overlayBorderRadius: '0',
    overlayColor: 'rgba(40,40,40,0.3)',
    pbColor: '#da2129',
    pbDirection: 'ltr',
    pbThickness: 3,
    hasProgressBar: true,
    text: '',
    textColor: '#da2129',
    textPosition: 'center-center',
    maxTime: -1,
    minTime: 300
};

@NgModule({
    declarations: [AppComponent, NotfoundComponent],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        TranslateModule.forRoot({
            defaultLanguage: 'th',
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgxUiLoaderModule.forRoot(configLoading),
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule
    ],
    providers: [
        { provide: LocationStrategy, useClass: PathLocationStrategy },
        CountryService,
        CustomerService,
        EventService,
        IconService,
        NodeService,
        PhotoService,
        ProductService,
        AuthGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        MessageService,
        ConfirmationService,
        GlobalService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
