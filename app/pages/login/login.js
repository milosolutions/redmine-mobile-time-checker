import { Page, NavController, NavParams, Storage, LocalStorage } from 'ionic-angular';
import { HomePage } from '../home/home'

@Page({
    templateUrl: 'build/pages/login/login.html'
})
export class LoginPage {
    static get parameters() {
        return [[NavController], [NavParams]];
    }

    constructor(nav) {
        this.nav = nav;
        this.local = new Storage(LocalStorage);
        this.key = '';
    }

    login(event) {
        this.local.set('key', this.key);

        // configuring default setting for working hours per week
        this.local.set('hours_week', 40);

        // for testing purpose setting up fake hours for current and last week
        this.local.set('hours_last', 38);
        this.local.set('hours_curr', 42);

        this.nav.push(HomePage, {
            key: this.key
        });
    }
}