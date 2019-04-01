import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicStorageModule } from '@ionic/storage';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
import { Geolocation} from '@ionic-native/geolocation'
import { AutoCompleteModule } from 'ionic2-auto-complete';
import { DatePickerModule } from 'datepicker-ionic2';
import { File } from '@ionic-native/file';
import { Printer } from '@ionic-native/printer';
import { DatePicker } from '@ionic-native/date-picker';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
//import { FileService } from '../providers/file.service';

//native components
import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { ImagePicker } from '@ionic-native/image-picker';
// translation module
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { IonicImageViewerModule } from 'ionic-img-viewer';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Http } from '@angular/http';
import { HttpModule } from '@angular/http';

import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
//import { FormViewComponent } from '../components/form-view/form-view';

//providers
import { PouchdbProvider } from '../providers/pouchdb-provider';
import { KoboProvider } from '../providers/kobo-provider';
import { AutoCompletion } from '../providers/auto-completion';
import { RestitutionProvider } from '../providers/restitution/restitution';
import { SiteProvider } from '../providers/site/site';
import { VillageProvider } from '../providers/village/village';
import { EmailComposer } from '@ionic-native/email-composer';


// needed to load translation from assets folder
export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    BrowserModule,
    AutoCompleteModule,
    DatePickerModule,
    IonicImageViewerModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    IonicStorageModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
  ],
  providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler }, AutoCompletion, Diagnostic, DatePicker, BarcodeScanner, PouchdbProvider, File, Printer, ImagePicker, Device, Sim, Geolocation, KoboProvider, Camera, StatusBar, SplashScreen,
    RestitutionProvider,
    EmailComposer,
    SiteProvider,
    VillageProvider,]
})
export class AppModule { }
