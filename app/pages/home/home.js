import { Page, NavController, NavParams, Storage, LocalStorage, Alert } from 'ionic-angular';
import { ReportPage } from '../report/report.js'
import { runSettingsAlert } from '../../directives/helpers'

@Page({
    templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
    static get parameters() {
        return [[NavController], [NavParams]];
    }

    constructor(nav, navParams) {
        this.nav = nav;
        this.local = new Storage(LocalStorage);
        this.last = this.local.get('hours_last')._result;
        this.week = this.local.get('hours_week')._result;
    }

    onPageWillEnter() {
        this.key = this.local.get('key')._result;
        this.hours = this.local.get('hours_curr')._result;
    }

    onPageDidEnter(){
        if (this.last < this.week){
            let alert = Alert.create({
                title: 'Warning',
                message: 'You worked '+ this.last + ' hours last week, while defined working hours per week is '+this.week + ' hours!',
                buttons: [
                    {
                        text: 'Confirm',
                        handler: () => {
                        }
                    },
                    {
                        text: 'I\'m on vacation!',
                        handler: () => {
                            runSettingsAlert({
                                name: 'vacation',
                                message: 'Please specify end of vacation period'
                            }, this.nav, this.local)
                        }
                    }
                ]
            });
            this.nav.present(alert);
        }
    }

    openReport(event){
        this.nav.push(ReportPage);
    }
}