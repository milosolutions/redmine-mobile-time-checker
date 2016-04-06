import { Page, NavController, Storage, LocalStorage, MenuController } from 'ionic-angular';
import { FORM_DIRECTIVES, FormBuilder,  ControlGroup, Validators, AbstractControl } from 'angular2/common';

import { ReportPage } from '../report/report';
import { RedmineApi } from '../../providers/redmine-api/redmine-api.js';

@Page({
    templateUrl: 'build/pages/login/login.html',
    providers: [RedmineApi]
})
export class LoginPage {
    static get parameters() {
        return [[NavController], [RedmineApi], [MenuController], [FormBuilder]];
    }

    constructor(nav, _redmineService, menu, fb) {
        this.nav = nav;
        this.menu = menu;
        this._redminer = _redmineService;
        this.local = new Storage(LocalStorage);
        this.authForm = fb.group({
            'url': ['', Validators.compose([Validators.required, this.checkRedmineUrl])],
            'secured': [false],
            'key': ['', Validators.compose([Validators.required])]
        });
        this.url = this.authForm.controls['url'];
        this.secured = this.authForm.controls['secured'];
        this.key = this.authForm.controls['key'];
    }

    checkRedmineUrl(control){
        //let valid = /redmine.(.{2,})?.com/.test(control.value);
        //if (control.value.length > 0 && !valid) {
        //    return {checkRedmineUrl: true}
        //}
    }

    onPageWillEnter(){
        this.menu.enable(false);
    }

    onPageWillLeave(){
        this.menu.enable(true);
    }

    login(formData) {
        let url = formData.secured ? 'https://' : 'http://';
        url += formData.url+'/';
        this._redminer.setRoot(url);
        this._redminer.load('users/current.json', formData.key).then(
            data => {
                let user = {};
                user.name = data.user.firstname+' '+data.user.lastname;
                user.email = data.user.mail;
                this.menu.setUser(user);

                this.local.set('key', data.user.api_key);
                this.local.set('user_id', data.user.id);
                // configuring default setting for working hours per week
                this.local.set('hours_week', 40);
                this.nav.setRoot(ReportPage);
                //location.reload();
            },
            error => {
                if (error.status != undefined && error.status == 401) {
                    this.key._errors = {checkKey: true};
                } else {
                    this.url._errors = {checkRedmineUrl: true};
                }
            }
        );

        // for testing purpose setting up fake hours for current and last week
        //this.local.set('hours_last', 38);
        //this.local.set('hours_curr', 42);
    }
}