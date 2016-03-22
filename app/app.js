import {App, Platform} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {TabsPage} from './pages/tabs/tabs';
import { Injectable, Injector } from 'angular2/core';
import { RedmineApi } from './providers/redmine-api/redmine-api.js'

@App({
    template: '<ion-nav [root]="rootPage"></ion-nav>',
    providers: [RedmineApi],
    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class MyApp {
    static get parameters() {
        return [[Platform], [RedmineApi]];
    }

    constructor(platform,  _redmineService) {
        this.rootPage = TabsPage;
        this.platform = platform;
        this._redminer = _redmineService;
        this.initializeApp();
    }
    initializeApp() {
        this.platform.ready().then(() => {
            this._redminer.load();

            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
        });
    }
}
//import { App, IonicApp, Platform, MenuController } from 'ionic-angular';
//import { HelloIonicPage } from './pages/hello-ionic/hello-ionic';
//import { ListPage } from './pages/list/list';
//
//
//@App({
//    templateUrl: 'build/app.html',
//
//    config: {} // http://ionicframework.com/docs/v2/api/config/Config/
//})
//class MyApp {
//    static get parameters() {
//        return [[IonicApp], [Platform], [MenuController], [RedmineApi]];
//    }
//
//    constructor(app, platform, menu, _redmineService) {
//        // set up our app
//        this._redminer = _redmineService;
//        this.app = app;
//        this.platform = platform;
//        this.menu = menu;
//        this.initializeApp();
//
//        // set our app's pages
//        this.pages = [
//            {title: 'Hello Ionic', component: HelloIonicPage},
//            {title: 'My First List', component: ListPage}
//        ];
//
//        // make HelloIonicPage the root (or first) page
//        this.rootPage = HelloIonicPage;
//    }
//
//    initializeApp() {
//        this.platform.ready().then(() => {
//            this._redminer.load();
//
//            // The platform is now ready. Note: if this callback fails to fire, follow
//            // the Troubleshooting guide for a number of possible solutions:
//            //
//            // Okay, so the platform is ready and our plugins are available.
//            // Here you can do any higher level native things you might need.
//            //
//            // First, let's hide the keyboard accessory bar (only works natively) since
//            // that's a better default:
//            //
//            //
//            // For example, we might change the StatusBar color. This one below is
//            // good for light backgrounds and dark text;
//
//            if (window.StatusBar) {
//                window.StatusBar.styleDefault();
//            }
//        });
//    }
//
//    openPage(page) {
//        // close the menu when clicking a link from the menu
//        this.menu.close();
//        // navigate to the new page if it is not the current page
//        let nav = this.app.getComponent('nav');
//        nav.setRoot(page.component);
//    }
//}
