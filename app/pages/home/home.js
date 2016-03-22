import { Page, NavController, NavParams, Storage, LocalStorage } from 'ionic-angular';
import { ReportPage } from '../report/report.js'

@Page({
    templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
    static get parameters() {
        return [[NavController], [NavParams]];
    }

    constructor(nav, navParams) {
        this.nav = nav;
        this.key = navParams.get('key');
    }

    openReport(event){
        this.nav.push(ReportPage);
    }
}