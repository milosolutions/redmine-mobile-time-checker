import { Page, NavController, Storage, LocalStorage, MenuController } from 'ionic-angular';
import { ReportPage } from '../report/report';
import { RedmineApi } from '../../providers/redmine-api/redmine-api.js';

@Page({
    templateUrl: 'build/pages/login/login.html',
    providers: [RedmineApi]
})
export class LoginPage {
    static get parameters() {
        return [[NavController], [RedmineApi], [MenuController]];
    }

    constructor(nav, _redmineService, menu) {
        this.nav = nav;
        this.menu = menu;
        this._redminer = _redmineService;
        this.local = new Storage(LocalStorage);
    }

    onPageWillEnter(){
        this.menu.enable(false);
    }

    onPageWillLeave(){
        this.menu.enable(true);
    }

    login(event) {
        this._redminer.load('users/current.json', this.key).then(
            data => {
                this.local.set('key', data.user.api_key);
                this.local.set('user_id', data.user.id);
                // configuring default setting for working hours per week
                this.local.set('hours_week', 40);
                //this.nav.setRoot(ReportPage)
                location.reload();
            },
            error => {
                console.log('error', error)
            }
        );

        // for testing purpose setting up fake hours for current and last week
        //this.local.set('hours_last', 38);
        //this.local.set('hours_curr', 42);
    }
}