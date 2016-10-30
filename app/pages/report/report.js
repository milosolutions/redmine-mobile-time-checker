import { Page, NavController, Storage, LocalStorage, Alert, Events } from 'ionic-angular';
import { Gesture } from 'ionic-angular/gestures/gesture';
import { SettingsPage } from '../settings/settings';
import { RedmineApi } from '../../providers/redmine-api/redmine-api.js';
import { runSettingsAlert } from '../../directives/helpers';
import { OnInit, OnDestroy, ElementRef } from 'angular2/core';


@Page({
    templateUrl: 'build/pages/report/report.html',
    providers: [RedmineApi]
})
export class ReportPage {
    static get parameters() {
        return [[NavController], [RedmineApi], [ElementRef], [Events]];
    }

    constructor(nav, _redmineService, content, events) {
        this.content = content.nativeElement;
        this.events = events;
        this.nav = nav;
        this.local = new Storage(LocalStorage);
        this.key = this.local.get('key')._result;
        this._redminer = _redmineService;
        this.entries_count = 1;
        this.week = parseInt(moment().isoWeek());
        this.isLastWeek = true;
        this.hours = 0.0;
        this.daygroups = [];
        this.loading = true;
        this.currentDay = moment().isoWeekday();
        this.currentWeek = this.week;
        this.eventsGesture = Gesture;

        for (var i = 0; i < 7; i++) {
            this.daygroups[i] = {
                name: moment().isoWeekday(i + 1).format("dddd"),
                issues: [],
                hours: 0,
                hidden: i != 0,
                weekend: (i == 5 || i === 6) ? true : false,
                lost: false
            };
        }

        this.mon = moment().isoWeek(this.week).startOf('isoWeek');
        this.sun = moment().isoWeek(this.week).endOf('isoWeek');
        if (this.local.get('display-alert')._result == "true") {
            this.checkLastWeekHours();
        } else {
            this.fetchReport();
        }
    }

    ngOnInit() {
        // this.events.subscribe('menu:dragged', () => {
        //     console.log('menu has been dragged');
        // });
        let gesture = this.content.querySelector('#gesture');
        this.eventsGesture = new Gesture(gesture);
        this.eventsGesture.listen();

        this.eventsGesture.on('swipeleft', e => {
            if (!this.isLastWeek) this.nextWeek(event);
        });
        this.eventsGesture.on('swiperight', e => {
            let calc = e.pointers[0].clientX - e.deltaX; 
            if (calc > 60) {
                this.prevWeek(event);
            }
        });
    }

    ngOnDestroy() {
        this.eventsGesture.destroy();
    }

    checkLastWeekHours() {
        let id = this.local.get('user_id')._result;
        let url = 'time_entries.json?limit=' + this.entries_count + '&spent_on=lw&user_id=' + id;
        if (this.entries_count == 1) {
            this._redminer.load(url, this.key).then(data => {
                this.entries_count = data.total_count;
                this.checkLastWeekHours();
            });
        } else {
            this._redminer.load(url, this.key).then(data => {
                let hours = 0;
                data.time_entries.forEach(entry => hours += entry.hours);

                let vacation = this.local.get('vacation')._result;
                let hours_week = this.local.get('hours_week')._result;
                vacation = new Date(vacation) > new Date();

                if (!vacation && hours < hours_week) {
                    let alert = Alert.create({
                        title: 'Warning',
                        message: 'Your last week hours is less than defined working hours per week',
                        buttons: [
                            {
                                text: 'CONFIRM',
                                role: 'cancel',
                                cssClass: 'fa fa-check confirm',
                                handler: () => {
                                    this.local.set('display-alert', false);
                                }
                            },
                            {
                                text: 'ON VACATION',
                                cssClass: 'fa fa-ban dismiss',
                                handler: () => {
                                    runSettingsAlert({
                                        name: 'vacation',
                                        message: 'Please specify end of vacation period'
                                    }, this.nav, this.local);
                                    this.local.set('display-alert', false);
                                }
                            }
                        ]
                    });
                    this.nav.present(alert);
                }
                this.entries_count = 1;
                this.fetchReport();
            });
        }
    }

    fetchReport() {
        this.loading = true;

        this.mon = moment().isoWeek(this.week).startOf('isoWeek');
        this.sun = moment().isoWeek(this.week).endOf('isoWeek');
        let mon = this.mon.format('YYYY-MM-DD');
        let sun = this.sun.format('YYYY-MM-DD');

        let id = this.local.get('user_id')._result;
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
                let first_url = url+'&offset='+offset;
                let fulldata = {};
                let inner = function(url){
                    this._redminer.load(url, this.key).then(data => {
                        if (fulldata.time_entries == undefined){
                            fulldata = data;
                        } else {
                            fulldata.time_entries = fulldata.time_entries.concat(data.time_entries);
                        }
                        if (fulldata.time_entries.length < this.entries_count) {
                            offset = data.time_entries.length;
                            inner(url+'&offset='+offset);
                        } else {
                            this.getReport(fulldata);
                            this.loading = false;
                        }
                    });
                }.bind(this);
                inner(first_url)
            }
        }
    }

    getReport(data) {
        this.daygroups.forEach(group => {
            group.hours = 0;
            group.issues = [];
        });

        let total = 0;
        let entries = data.time_entries;
        entries.forEach(entry => {
            let day = new Date(entry.spent_on).getDay();
            let group = this.daygroups[day - 1];
            group.hours += entry.hours;
            total += Number(entry.hours);
            let filter = group.issues.filter(issue => issue.id == entry.issue.id);

            if (filter.length == 0) {
                group.issues.push({
                    project: entry.project.name,
                    id: entry.issue.id,
                    hours: entry.hours,
                    subject: ''
                })
            } else {
                let index = group.issues.indexOf(filter[0]);

                group.issues[index].hours += entry.hours;
            }
        });
        let currentWeek = this.currentWeek === this.week;
        this.hours = total;

        this.daygroups.forEach((group, index) => {
            group.issues.forEach(issue => {
                this._redminer.load('issues/' + issue.id + '.json', this.key).then(data => {
                    issue.subject = data.issue.subject;
                });
            })

            if (currentWeek) {
                group.lost = (index < this.currentDay-1) ? true : false;
            } else {
                group.lost = true;
            }

        });

    }

    onPageWillEnter() {
        this.key = this.local.get('key')._result;
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
        if (this.week + 1 <= parseInt(moment().isoWeek()))
            this.week = parseInt(this.week) + 1;
        else
            return;
        this.entries_count = 1;
        this.isLastWeek = this.week == parseInt(moment().isoWeek());
        this.fetchReport();
    }
    prevWeek(event) {
        if (this.week - 1 > 0)
            this.week = parseInt(this.week) - 1;
        else
            return;
        this.entries_count = 1;
        this.isLastWeek = false;
        this.isFirstWeek = this.week -1 == 0;
        this.fetchReport();
    }
}