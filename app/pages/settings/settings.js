import { Page, NavController, Alert, Storage, LocalStorage } from 'ionic-angular';
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
        this.top_bg = 'img/settings_top_2.jpg';
        var is_end_vacation = false;
        if (end_vacation != null){
            this.top_bg = 'img/settings_top.jpg';
            is_end_vacation = new Date(end_vacation) > new Date();
        }
        let hours = this.local.get('hours_week')._result;
        this.settings = [
            {
                title: 'I\'m on vacation!',
                name: 'vacation',
                message: 'Please specify end of vacation period',
                toggled: is_end_vacation,
                date: end_vacation != null ? new Date(end_vacation): ''
            },
            {
                title: 'Change working hours per week',
                name: 'hours_week',
                message: 'Current working hours',
                placeholder: 'Enter new working hours',
                value: hours,
                current: hours
            },
            {
                title: 'Update Redmine API key',
                name: 'key',
                message: 'Current API key',
                placeholder: 'Enter new API key',
                value: key
            }
        ];
    }

    update(setting) {
        if (setting.name == 'vacation' && setting.toggled) {
            this.local.remove('vacation');
            setting.date = '';
        } else {
            runSettingsAlert(setting, this.nav, this.local);
        }
    }
}