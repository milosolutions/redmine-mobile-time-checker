import { Component, Injectable, Inject } from '@angular/core';
import { Http, Request, RequestOptions, Headers, RequestMethod } from '@angular/http';
import 'rxjs/Rx';

/*
 Generated class for the RedmineApi provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
@Component({
    providers: [  ]
})
export class RedmineApi {
    root: string = 'https://redmine.milosolutions.com/';
    requestoptions: any;
    data: any = [];
    apiKey: any = '';

    constructor(private http: Http) {
        // mobile settings
        // this.root = 'https://redmine.milosolutions.com/';
        // developer settings
        if (navigator.platform == 'Win32')
            this.root = 'api/';
    }

    setRoot(url){
        if (navigator.platform != 'Win32')
            this.root = url;
    }

    setKey(key){
        this.apiKey = key;
    }

    public load: any = function(url, key) {
        if (key != undefined)
            this.apiKey = key;
        else
            key = this.apiKey;
        let headers = new Headers();
        headers.append("Content-Type", 'application/json');
        headers.append("X-Redmine-API-Key", key);
        this.requestoptions = new RequestOptions({
            url: this.root + url,
            method: RequestMethod.Get,
            headers: headers
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
    };

    public login: any = function(url, username, password) {
        let headers = new Headers();
        headers.append("Authorization", "Basic " + btoa(username + ":" + password));
        headers.append("Content-Type", "application/json");
        this.requestoptions = new RequestOptions({
            url: this.root + url,
            method: RequestMethod.Get,
            headers: headers
        });
        return new Promise((resolve, reject) => {
            this.http.request(new Request(this.requestoptions))
                .subscribe(
                    data => {
                        console.log('data in', data);
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

