import { Page, NavController, Storage, LocalStorage } from 'ionic-angular';
import { SettingsPage } from '../settings/settings'
import { RedmineApi } from '../../providers/redmine-api/redmine-api.js'

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
        this.week = moment().isoWeek();
        this.hours = 0;
        this.daygroups = [];
        for (var i=0; i<7; i++) {
            this.daygroups[i] = {
                name: moment().isoWeekday(i+1).format("dddd"),
                issues: [],
                hours: 0,
                hidden: i!=0
            };
        }

        this.mon = moment().isoWeek(this.week).startOf('isoWeek');
        this.sun = moment().isoWeek(this.week).endOf('isoWeek');
        this.getReport();
    }


    toggleGroup (group) {
        group.hidden = !group.hidden;
    };
    isGroupHidden (group) {
        return group.hidden;
    };

    getWeek(){
        return parseInt(this.week);
    }

    getReport() {
        this.loading = true;

        this.mon = moment().isoWeek(this.week).startOf('isoWeek');
        this.sun = moment().isoWeek(this.week).endOf('isoWeek');
        let mon = this.mon.format('YYYY-MM-DD');
        let sun = this.sun.format('YYYY-MM-DD');

        let id = this.local.get('user_id')._result;
        let url = 'time_entries.json?limit=' + this.entries_count + '&spent_on=><' + mon + '|' + sun + '&user_id=' + id;

        this._redminer.load(url, this.key).then(data => {
            if (data.total_count > this.entries_count) {
                this.entries_count = data.total_count;
                this.getReport();
            } else {
                this.daygroups.forEach(group => {
                    group.hours = 0;
                    group.issues = [];
                });

                let total = 0;
                let entries = data.time_entries;
                entries.forEach(entry => {
                    let day = new Date(entry.spent_on).getDay();
                    let group = this.daygroups[day-1];
                    group.hours += entry.hours;
                    total += Number(entry.hours);
                    let filter = group.issues.filter(issue => issue.id == entry.issue.id);
                    if (filter.length == 0){
                        group.issues.push({project: entry.project.name, id: entry.issue.id, hours: entry.hours, subject: ''})
                    } else {
                        let index = group.issues.indexOf(filter[0]);
                        console.log(group.issues[index].id, day);
                        group.issues[index].hours += entry.hours;
                    }
                });
                this.hours = total;

                this.daygroups.forEach(group => {
                    group.issues.forEach(issue => {
                        this._redminer.load('issues/'+issue.id+'.json', this.key).then(data => {
                            issue.subject = data.issue.subject;
                        });
                    })
                });
                this.loading = false;
                //
                //if (this.period == 'lw'){
                //    this.local.set('hours_last', total.total);
                //    this.lhours = total.total;
                //} else {
                //    this.local.set('hours_curr', total.total);
                //}
            }
        });
    }

    onPageWillEnter() {
        this.key = this.local.get('key')._result;
        this.hours = this.local.get('hours_curr')._result;
        this.lhours = this.local.get('hours_last')._result;
    }

    refresh(event) {
        this.getReport();
    }

    settings(event) {
        this.nav.push(SettingsPage);
    }
}