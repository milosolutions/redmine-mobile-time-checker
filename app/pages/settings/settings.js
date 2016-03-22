import { Page, NavController, NavParams, Storage, LocalStorage } from 'ionic-angular';
import { HomePage } from '../home/home'

@Page({
    templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {
    static get parameters() {
        return [[NavController], [NavParams]];
    }

    constructor(nav, navParams) {
        this.nav = nav;
    }

    save(event){
        this.nav.pop();
    }
}