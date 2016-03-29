import { Page, NavController, Storage, LocalStorage } from 'ionic-angular';
import { ReportPage } from '../report/report';
import { RedmineApi } from '../../providers/redmine-api/redmine-api.js';

@Page({
    templateUrl: 'build/pages/login/login.html',
    providers: [RedmineApi]
})
export class LoginPage {
    static get parameters() {
        return [[NavController], [RedmineApi]];
    }

    constructor(nav, _redmineService) {
        this.nav = nav;
        this._redminer = _redmineService;
        this.local = new Storage(LocalStorage);
    }

    login(event) {
        this._redminer.load('users/current.json', this.key).then(
            data => {
                this.local.set('key', data.user.api_key);
                // configuring default setting for working hours per week
                this.local.set('hours_week', 40);
                this.nav.setRoot(ReportPage)
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