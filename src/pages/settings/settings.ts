import { NavController, AlertController } from 'ionic-angular';
import {Storage} from '@ionic/storage';
import { Component } from '@angular/core';
import { runSettingsAlert } from '../../directives/helpers'

@Component({
    templateUrl: './settings.html'
})
export class SettingsPage {
    top_bg: boolean = false;
    settings: any = [];

    constructor(private nav: NavController, private storage: Storage, private alertCtrl: AlertController) {
        this.storage.get('key').then(key => {
            this.storage.get('vacation').then(end_vacation => {
                let is_end_vacation = false;
                if (end_vacation != null){
                    // this.top_bg = 'background-image: url(img/settings_top.jpg)';
                    this.top_bg = true;
                    is_end_vacation = new Date(end_vacation) > new Date();
                }
                this.storage.get('hours_week').then(hours => {
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
                });
            });
        });
    }

    update(setting) {
        if (setting.name == 'vacation' && setting.toggled) {
            this.storage.remove('vacation');
            setting.date = '';
        } else {
            runSettingsAlert(setting, this.alertCtrl, this.storage);
        }
    }
}