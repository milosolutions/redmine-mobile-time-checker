import { Component, Injectable, Inject } from 'angular2/core';
import { HTTP_PROVIDERS, Http, Request, RequestOptions, Headers, RequestMethod } from 'angular2/http';

/*
 Generated class for the RedmineApi provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
@Component({
    providers: [ HTTP_PROVIDERS ]
})
export class RedmineApi {
    static get parameters() {
        return [[Http]];
    }

    constructor(http) {
        this.http = http;
        this.data = null;
        // mobile settings
        this.root = 'https://redmine.milosolutions.com/';
        // developer settings
        if (navigator.platform == 'Win32')
            this.root = 'api/';
    }

    load() {
        if (this.data) {
            // already loaded data
            return Promise.resolve(this.data);
        }
        this.headers = new Headers();
        this.headers.append("Content-Type", 'application/json');
        this.headers.append("X-Redmine-API-Key", 'xxxx');
        this.requestoptions = new RequestOptions({
            url: this.root + 'users/current.json',
            method: RequestMethod.Get,
            headers: this.headers
        });

        return this.http.request(new Request(this.requestoptions))
                .subscribe(
                    data => {
                        console.log(data.json());
                    },
                    err => console.log(err.json())
                );
    }
}

