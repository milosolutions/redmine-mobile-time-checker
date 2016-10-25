import { Component, Injectable } from 'angular2/core';
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
        // mobile settings
        this.root = 'https://redmine.milosolutions.com/';
        // developer settings
        if (navigator.platform == 'Win32')
            this.root = 'api/';
    }

    setRoot(url){
        if (navigator.platform != 'Win32')
            this.root = url;
    }

    load(url, key) {
        this.headers = new Headers();
        this.headers.append("Content-Type", 'application/json');
        this.headers.append("X-Redmine-API-Key", key);
        this.requestoptions = new RequestOptions({
            url: this.root + url,
            method: RequestMethod.Get,
            headers: this.headers
        });

        return new Promise((resolve, reject) => {
            this.http.request(new Request(this.requestoptions))
                .subscribe(
                    data => {
                        this.data = data.json();
                        resolve(this.data);
                    },
                    err => {
                        if (err.status != 401)
                            reject(err.json());
                        else
                            reject({type: 'error', status: 401});
                    }
                );
        });
    }
}

