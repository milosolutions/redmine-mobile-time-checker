import {NavController, MenuController} from 'ionic-angular';
import {Component} from '@angular/core';
import {Storage} from '@ionic/storage';
import {FormBuilder, Validators, AbstractControl} from '@angular/forms';

import {ReportPage} from '../report/report';
import {RedmineApi} from '../../providers/redmine-api/redmine-api';

@Component({
    templateUrl: './login.html',
    providers: [RedmineApi]
})
export class LoginPage {
    authForm: any;
    authPwdForm: any;
    url: any;
    secured: any;
    key: any;
    username: any;
    password: any;
    keyLogin: boolean = false;
    checkRedmineUrl: boolean = true;

    constructor(private nav: NavController, private _redminer: RedmineApi,
                public menu: MenuController, private fb: FormBuilder, private storage: Storage) {

        this.authForm = fb.group({
            'url': ['redmine.milosolutions.com', Validators.compose([Validators.required])],
            'secured': [true],
            'key': ['', Validators.compose([Validators.required])]
        });
        this.authPwdForm = fb.group({
            'url': ['redmine.milosolutions.com', Validators.compose([Validators.required])],
            'secured': [true],
            'username': ['', Validators.compose([Validators.required])],
            'password': ['', Validators.compose([Validators.required])]
        });
        this.username = this.authPwdForm.controls['username'];
        this.password = this.authPwdForm.controls['password'];
        this.url = this.authForm.controls['url'];
        this.secured = this.authForm.controls['secured'];
        this.key = this.authForm.controls['key'];
    }

    onPageWillEnter() {
        this.menu.enable(false);
    }

    onPageWillLeave() {
        this.menu.enable(true);
    }

    showPassword(input: any): any {
        input.type = input.type === 'password' ?  'text' : 'password';
    }

    switchLogin() {
        this.keyLogin = !this.keyLogin;
    }

    lower_url() {
        this.url._value = this.url._value.toLowerCase();
    }

    loginKey(formData) {
        let url = formData.secured ? 'https://' : 'http://';
        url += formData.url.replace('www.', '').replace(/\s/g, '') + '/';
        this._redminer.setRoot(url);

        this._redminer.login('users/current.json', formData.key).then(
            data => {
                let user = {name: '', email: ''};
                user.name = data.user.firstname + ' ' + data.user.lastname;
                user.email = data.user.mail;
                this.storage.set('user', user);

                this.storage.set('key', data.user.api_key);
                this.storage.set('user_id', data.user.id);
                // configuring default setting for working hours per week
                this.storage.set('hours_week', 40);
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

    loginPwd(formData) {
        let url = formData.secured ? 'https://' : 'http://';
        url += formData.url.replace('www.', '').replace(/\s/g, '') + '/';
        this._redminer.setRoot(url);
        let username = formData.username.toLowerCase();

        this._redminer.login('users/current.json', username, formData.password).then(
            data => {
                console.log(data);
                let user = {name: '', email: ''};
                user.name = data.user.firstname + ' ' + data.user.lastname;
                user.email = data.user.mail;
                this.storage.set('user', user);

                this.storage.set('key', data.user.api_key);
                this.storage.set('user_id', data.user.id);
                // configuring default setting for working hours per week
                this.storage.set('hours_week', 40);
                this.nav.setRoot(ReportPage);
            },
            error => {
                if (error.status != undefined && error.status == 401) {
                    this.username._errors = {invalid: true};
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