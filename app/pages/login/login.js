import { Page, NavController, Storage, LocalStorage, MenuController } from 'ionic-angular';
import { FORM_DIRECTIVES, FormBuilder, ControlGroup, Validators, AbstractControl, OnInit } from 'angular2/common';

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
        this.fb = fb;
        this._redminer = _redmineService;
        this.local = new Storage(LocalStorage);
        this.authType = 'key';
        this.authFormKey = this.fb.group({
            'url': ['', Validators.compose([])],
            'secured': [false],
            'key': ['', Validators.compose([Validators.required])]
        });
        this.authFormBasic = this.fb.group({
            'url': ['', Validators.compose([])],
            'secured': [false],
            'email': ['', Validators.compose([Validators.required])],
            'password': ['', Validators.compose([Validators.required])] 
        });
        this.setFormFields(this.authType);
    }
    onPageWillEnter(){
        this.menu.enable(false);
    }

    onPageWillLeave(){
        this.menu.enable(true);
    }

    setFormFields(type) {
        this.url = this.authFormKey.controls['url'] = this.authFormBasic.controls['url'];
        this.secured = this.authFormKey.controls['secured'] = this.authFormBasic.controls['secured'];
        this.key = this.authFormKey.controls['key'];
        this.email = this.authFormBasic.controls['email'];
        this.password = this.authFormBasic.controls['password'];
    }

    lower_url(){
        this.url._value = this.url._value.toLowerCase();
    }

    onChangeMethod(type) {
        this.setFormFields(type);
    }

    login(formData) {
        let url = formData.secured ? 'https://' : 'http://';
        url += formData.url.replace('www.','').replace(/\s/g,'')+'/';
        this._redminer.setRoot(url);

        this._redminer.load('users/current.json', formData.key, formData.email, formData.password).then(
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