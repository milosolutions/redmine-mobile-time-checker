import { Page, NavController, Alert, Storage, LocalStorage } from 'ionic-angular';
import { HomePage } from '../home/home'
import { runSettingsAlert } from '../../directives/helpers'

@Page({
    templateUrl: 'build/pages/settings/settings.html'
})
export class SettingsPage {
    static get parameters() {
        return [[NavController]];
    }

    constructor(nav) {
        this.nav = nav;
        this.local = new Storage(LocalStorage);
        let key = this.local.get('key')._result;
        let end_vacation = this.local.get('vacation')._result;
        if (end_vacation != null){
            end_vacation = new Date(end_vacation) > new Date();
        }
        let hours = this.local.get('hours_week')._result;
        this.settings = [
            {
                title: 'I\'m on vacation!',
                name: 'vacation',
                message: 'Please specify end of vacation period',
                toggled: end_vacation
            },
            {
                title: 'Change working hours per week',
                name: 'hours_week',
                message: 'Current hours: ' + hours,
                placeholder: 'Enter new working hours',
                current: hours
            },
            {
                title: 'Update Redmine API key',
                name: 'key',
                message: 'Current key: ' + key,
                placeholder: 'Enter new API key'
            }
        ];
    }

    update(setting) {
        runSettingsAlert(setting, this.nav, this.local);
    }
}