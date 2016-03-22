import { Page, NavController, NavParams, Storage, LocalStorage } from 'ionic-angular';
import { SettingsPage } from '../settings/settings'

@Page({
    templateUrl: 'build/pages/report/report.html'
})
export class ReportPage {
    static get parameters() {
        return [[NavController], [NavParams]];
    }

    constructor(nav, navParams) {
        this.nav = nav;
        this.key = navParams.get('key');
    }

    refresh(event){

    }

    settings(event){
        this.nav.push(SettingsPage);
    }
}