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
        // used push instead of setRoot in order to get 'back' button
        this.nav.push(HomePage, {
            key: this.key
        });
    }
}