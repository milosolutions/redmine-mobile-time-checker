import {NgModule, ErrorHandler} from '@angular/core';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http'
import {Storage} from '@ionic/storage';

import {MyApp} from './app.component';
import {LoginPage} from '../pages/login/login';
import {ReportPage} from '../pages/report/report';
import {SettingsPage} from '../pages/settings/settings';

function provideStorage() {
    return new Storage(['sqlite', 'websql', 'indexeddb'], {name: '__mydb'});// optional config);
}

@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        ReportPage,
        SettingsPage
    ],
    imports: [
        IonicModule.forRoot(MyApp),
        FormsModule,
        HttpModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        LoginPage,
        ReportPage,
        SettingsPage
    ],
    providers: [
        Storage,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
        ]
})
export class AppModule {
}
