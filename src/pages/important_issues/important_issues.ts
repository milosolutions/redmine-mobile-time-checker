import {NavController, AlertController, Events, Slides} from 'ionic-angular';
import {Component} from '@angular/core';
import {Storage} from '@ionic/storage';
import {OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import {RedmineApi} from '../../providers/redmine-api/redmine-api'

import {FilterPipe} from '../../directives/helpers'
import {runSettingsAlert} from '../../directives/helpers'
import * as moment from 'moment'

@Component({
    templateUrl: './important_issues.html',
    providers: [RedmineApi, Storage]
})
export class ImportantIssuesPage {
    @ViewChild('slides') slides: Slides;
    key: any;
    entries_count: any;
    week: number;
    minPriority: number = 2;
    isLastWeek: any;
    isFirstWeek: any;
    issues: number;
    daygroups: any;
    loading: any;
    mon: any;
    sun: any;
    weeks: any[];
    initialSlide: any;


    constructor(protected nav: NavController, protected _redminer: RedmineApi,
                protected alertCtrl: AlertController, protected storage: Storage,
                protected events: Events) {
        this.entries_count = 1;
        this.week = moment().isoWeek();
        this.isLastWeek = true;
        this.issues = 0;
        this.daygroups = [];
        this.loading = true;

        this.weeks = [];
        this.initialSlide = this.week - 1;


        for (let i = 1; i <= this.week; i++) {
            this.weeks.push({
                num: i,
                mon: moment().isoWeek(i).startOf('isoWeek'),
                sun: moment().isoWeek(i).endOf('isoWeek')
            })
        }

        for (let i = 0; i < 7; i++) {
            this.daygroups[i] = {
                name: moment().isoWeekday(i + 1).format("dddd"),
                issues: [],
                hours: 0,
                hidden: i != 0
            };
        }

        this.storage.get('key').then(key => this.key = key);
        this.storage.get('display-alert').then(result => {
            if (result == "true") {
                this.checkLastWeekHours();
            } else {
                this.fetchReport();
            }
        })
    }

    ngOnInit() {
        this.events.subscribe('menu:dragged', () => {
            console.log('menu has been dragged');
        });
    }

    ngOnDestroy() {
    }

    checkLastWeekHours() {
        this.storage.get('user_id').then(id => {
            let url = 'time_entries.json?limit=' + this.entries_count + '&spent_on=lw&user_id=' + id;
            if (this.entries_count == 1) {
                this._redminer.load(url).then(data => {
                    this.entries_count = data.total_count;
                    this.checkLastWeekHours();
                });
            } else {
                this._redminer.load(url).then(data => {
                    let hours = 0;
                    console.log(data.time_entries);
                    data.time_entries.forEach(entry => hours += entry.hours);

                    this.storage.get('vacation').then(vacation => {
                        vacation = new Date(vacation) > new Date();
                        this.storage.get('hours_week').then(hours_week => {
                            if (!vacation && hours < hours_week) {
                                let alert = this.alertCtrl.create({
                                    title: 'Warning',
                                    message: 'Your last week hours is less than defined working hours per week',
                                    buttons: [
                                        {
                                            text: 'CONFIRM',
                                            role: 'cancel',
                                            cssClass: 'fa fa-check confirm',
                                            handler: () => {
                                                this.storage.set('display-alert', false);
                                            }
                                        },
                                        {
                                            text: 'ON VACATION',
                                            cssClass: 'fa fa-ban dismiss',
                                            handler: () => {
                                                runSettingsAlert({
                                                    name: 'vacation',
                                                    message: 'Please specify end of vacation period'
                                                }, this.nav, this.storage);
                                                this.storage.set('display-alert', false);
                                            }
                                        }
                                    ]
                                });
                                alert.present();
                            }
                            this.entries_count = 1;
                            this.fetchReport();
                        });
                    });
                });
            }
        });
    }

    fetchReport() {
        this.loading = true;

        this.mon = moment().isoWeek(this.week).startOf('isoWeek');
        this.sun = moment().isoWeek(this.week).endOf('isoWeek');
        let mon = this.mon.format('YYYY-MM-DD');
        let sun = this.sun.format('YYYY-MM-DD');
        this.storage.get('user_id').then(id => {
            let url = 'time_entries.json?limit=' + this.entries_count + '&spent_on=><' + mon + '|' + sun + '&user_id=' + id;
            if (this.entries_count == 1) {
                this._redminer.load(url, this.key).then(data => {
                    this.entries_count = data.total_count;
                    this.fetchReport();
                });
            } else {
                if (this.entries_count <= 100)
                    this._redminer.load(url, this.key).then(data => {
                        this.getReport(data);
                        this.loading = false;
                    });
                else {
                    let offset = 0;
                    let first_url = url + '&offset=' + offset;
                    let fulldata = {time_entries: ''};
                    let inner = function (url) {
                        this._redminer.load(url, this.key).then(data => {
                            if (fulldata.time_entries == undefined) {
                                fulldata = data;
                            } else {
                                fulldata.time_entries = fulldata.time_entries.concat(data.time_entries);
                            }
                            if (fulldata.time_entries.length < this.entries_count) {
                                offset = data.time_entries.length;
                                inner(url + '&offset=' + offset);
                            } else {
                                this.getReport(fulldata);
                                this.loading = false;
                            }
                        });
                    }.bind(this);
                    inner(first_url)
                }
            }
        });
    }

    getReport(data) {
        this.daygroups.forEach(group => {
            group.hours = 0;
            group.issues = [];
        });

        let total = 0;
        let entries = data.time_entries;
        entries.forEach((entry, i) => {
            let day = new Date(entry.spent_on).getDay();
            let group = this.daygroups[day - 1];
            // total += Number(entry.hours);

            this._redminer.load('issues/' + entry.issue.id + '.json', this.key).then(data => {
                if (data.issue.priority.id > this.minPriority) {
                    let filter = group.issues.filter(issue => issue.id == entry.issue.id);
                    if (filter.length == 0) {
                        let name = data.issue.status.name;
                        name = data.issue.status.name.replace('Development: ', '');
                        name = /Done/.test(name) ? 'Done' : name;
                        group.issues.push({
                            project: entry.project.name,
                            id: entry.issue.id,
                            hours: entry.hours,
                            subject: data.issue.subject,
                            priority: data.issue.priority.id,
                            status: name,
                            color: /Requested/.test(name) ? 'red' : /Done/.test(name) ? 'green' : 'yellow'
                        });
                        group.hours += entry.hours;
                    } else {
                        let index = group.issues.indexOf(filter[0]);
                        group.issues[index].hours += entry.hours;
                    }
                }
                if (i == entries.length - 1) {
                    let groups = this.daygroups.map(group => group.issues);
                    groups = [].concat.apply([], groups);
                    let issues = [];
                    groups.forEach(group => {
                        if (issues.indexOf(group.id) == -1) {
                            issues.push(group.id)
                        }
                    });
                    document.getElementById('total-' + this.week).textContent = issues.length.toString();
                }
            });
        });
    }

    onPageWillEnter() {
        this.storage.get('key').then(result => {
            this.key = result
        });
    }

    refresh(event) {
        this.fetchReport();
    }

    toggleGroup(group) {
        group.hidden = !group.hidden;
    };

    isGroupHidden(group) {
        return group.hidden;
    };

    nextWeek(event) {
        // Button "Next" clicked
        if (event.type == "click")
            this.slides.slideNext(500);
        else {
            if (this.week + 1 <= moment().isoWeek())
                this.week = this.week + 1;
            else
                return;

            this.entries_count = 1;
            this.isFirstWeek = false;
            this.isLastWeek = this.week == moment().isoWeek();
            this.fetchReport();
        }
    }
    prevWeek(event) {
        // Button "Prev" clicked
        if (event.type == "click")
            this.slides.slidePrev(500);
        else {

            if (this.week - 1 > 0)
                this.week = this.week - 1;
            else
                return;

            this.entries_count = 1;
            this.isLastWeek = false;
            this.isFirstWeek = this.week -1 == 0;
            this.fetchReport();
        }
    }
}