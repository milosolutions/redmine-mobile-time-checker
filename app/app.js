import { App, Platform, IonicApp, Storage, LocalStorage, MenuController } from 'ionic-angular';
import { StatusBar } from 'ionic-native';
import { LoginPage } from './pages/login/login.js';
import { HomePage } from './pages/home/home.js';
import { ReportPage } from './pages/report/report.js';
import { SettingsPage } from './pages/settings/settings.js';
import { Injectable, Injector } from 'angular2/core';
import { RedmineApi } from './providers/redmine-api/redmine-api.js'

@App({
    templateUrl: 'build/app.html',
    providers: [RedmineApi],
    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
    static get parameters() {
        return [[IonicApp], [Platform], [RedmineApi], [MenuController]];
    }

    constructor(app, platform,  _redmineService, menu) {
        this.app = app;
        this.platform = platform;
        this.menu = menu;
        this._redminer = _redmineService;
        this.initializeApp();

        this.pages = [
            { title: 'Home', component: HomePage },
            { title: 'Redmine report', component: ReportPage },
            { title: 'Settings', component: SettingsPage }
        ];

        this.local = new Storage(LocalStorage);
        let hasKey = this.local.get('key')._result != null;
        if (!hasKey) {
            this.rootPage = LoginPage;
        } else {
            this.rootPage = HomePage;
        }
    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, let's pass key parameter this way
            let key = this.local.get('key')._result;
            if (key != null) {
                let nav = this.app.getComponent('nav');
                nav.setRoot(HomePage, {
                    key: key
                });
            }
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
        });
    }

    openPage(page) {
        // close the menu when clicking a link from the menu
        this.menu.close();
        // navigate to the new page if it is not the current page
        let nav = this.app.getComponent('nav');
        if (page.title === 'Settings') {
            nav.push(page.component);
        } else {
            nav.setRoot(page.component);
        }
    }
}