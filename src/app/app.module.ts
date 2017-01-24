import {NgModule, ErrorHandler} from '@angular/core';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http'
import {Storage} from '@ionic/storage';

import { CustomIconsModule } from 'ionic2-custom-icons';

import {MyApp} from './app.component';
import {LoginPage} from '../pages/login/login';
import {ReportPage} from '../pages/report/report';
import {SettingsPage} from '../pages/settings/settings';
import {ImportantIssuesPage} from '../pages/important_issues/important_issues';
import { FilterPipe } from '../directives/helpers'

function provideStorage() {
    return new Storage(['sqlite', 'websql', 'indexeddb'], {name: '__mydb'});// optional config);
}

@NgModule({
    declarations: [
        MyApp,
        LoginPage,
        ReportPage,
        SettingsPage,
        ImportantIssuesPage,
        FilterPipe
    ],
    imports: [
        IonicModule.forRoot(MyApp, {
            // scrollAssist: false,    // Valid options appear to be [true, false]
            // autoFocusAssist: false  // Valid options appear to be ['instant', 'delay', false]
        }),
        FormsModule,
        HttpModule,
        CustomIconsModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        LoginPage,
        ReportPage,
        SettingsPage,
        ImportantIssuesPage
    ],
    providers: [
        Storage,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
        ]
})
export class AppModule {
}
