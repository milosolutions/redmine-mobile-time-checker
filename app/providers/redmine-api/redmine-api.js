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

    load(url, key, email, password) {
        this.headers = new Headers();
        this.headers.append("Content-Type", 'application/json');
        this.headers.append("Access-Control-Allow-Origin", "*");
        if (typeof key !== 'undefined') {
            this.headers.append("X-Redmine-API-Key", key);
        }
        if (typeof email !== 'undefined' && typeof password !== 'undefined') {
            let Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}},
                authdata = Base64.encode(email + ':' + password);
            this.headers.append("Access-Control-Max-Age", "3600");
            this.headers.append("Authorization", "Basic " + authdata);
        }

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