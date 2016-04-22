import { Page, NavController, Storage, LocalStorage, Alert } from 'ionic-angular';
import { SettingsPage } from '../settings/settings'
import { RedmineApi } from '../../providers/redmine-api/redmine-api.js'
import { runSettingsAlert } from '../../directives/helpers'

@Page({
    templateUrl: 'build/pages/report/report.html',
    providers: [RedmineApi]
})
export class ReportPage {
    static get parameters() {
        return [[NavController], [RedmineApi]];
    }

    constructor(nav, _redmineService) {
        this.nav = nav;
        this.local = new Storage(LocalStorage);
        this.key = this.local.get('key')._result;
        this._redminer = _redmineService;
        this.entries_count = 1;
        this.week = parseInt(moment().isoWeek());
        this.hours = 0;
        this.daygroups = [];
        this.loading = true;
        for (var i = 0; i < 7; i++) {
            this.daygroups[i] = {
                name: moment().isoWeekday(i + 1).format("dddd"),
                issues: [],
                hours: 0,
                hidden: i != 0
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
            this._redminer.load(url, this.key).then(data => {
                console.log(data)
                this.getReport(data);
                this.loading = false;
            });
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
        this.hours = total;

        this.daygroups.forEach(group => {
            group.issues.forEach(issue => {
                this._redminer.load('issues/' + issue.id + '.json', this.key).then(data => {
                    issue.subject = data.issue.subject;
                });
            })
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
        console.log(this.week)
    }
    prevWeek(event) {
        if (this.week - 1 > 0)
            this.week = parseInt(this.week) - 1;
        console.log(this.week)
    }
}