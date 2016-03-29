import { Page, NavController, Storage, LocalStorage } from 'ionic-angular';
import { SettingsPage } from '../settings/settings'
import { RedmineApi } from '../../providers/redmine-api/redmine-api.js'
// Returns the ISO week of the date.
//Date.prototype.getWeek = function(){
//    var d = new Date(+this);
//    d.setHours(0,0,0);
//    d.setDate(d.getDate()+4-(d.getDay()||7));
//    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
//};

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
        this.total = 1;
        this.week = moment().isoWeek();
        this.hours = 0;
        this.mon = moment().isoWeek(this.week).startOf('isoWeek');
        this.sun = moment().isoWeek(this.week).endOf('isoWeek');
        this.getReport();
    }

    getWeek(){
        return parseInt(this.week);
    }

    float(string){
        return string == '' ? 0.00 : Number(string);
    }

    getReport() {
        this.mon = moment().isoWeek(this.week).startOf('isoWeek');
        this.sun = moment().isoWeek(this.week).endOf('isoWeek');
        let mon = this.mon.format('YYYY-MM-DD');
        let sun = this.sun.format('YYYY-MM-DD');
        console.log(mon, sun);
        let empty_record = {project: '', issue: '', 1: '', 2: '', 3: '', 4: '', 5: '', 6: '', 0: '', total: 0};
        let id = this.local.get('user_id')._result;
        let url = 'time_entries.json?limit=' + this.total + '&spent_on=><' + mon + '|' + sun + '&user_id=' + id;
        this.loading = true;
        this._redminer.load(url, this.key).then(data => {
            console.log(data)
            this.data = [];
            if (data.total_count > this.total) {
                this.total = data.total_count;
                this.getReport();
            } else {
                let entries = data.time_entries;
                let projects = {};
                entries.forEach(entry => {
                    if (!(entry.project.name in projects)) {
                        projects[entry.project.name] = [entry]
                    } else {
                        projects[entry.project.name].push(entry)
                    }
                });
                let total = Object.create(empty_record);
                total.project = 'Total time';
                total.total = 0;

                Object.keys(projects).forEach(key => {
                    let prj_entry = Object.create(empty_record);
                    prj_entry.project = key;
                    let issues = [];
                    projects[key].forEach(entry => {
                        let day = new Date(entry.spent_on).getDay();
                        let filter = issues.filter(issue => issue.issue == entry.issue.id);
                        if (filter.length > 0) {
                            let issue = filter[0];
                            issue[day] = this.float(issue[day]) + this.float(entry.hours);
                        } else {
                            let issue = Object.create(empty_record);
                            issue.issue = entry.issue.id;
                            issue[day] = this.float(entry.hours);
                            issues.push(issue);
                        }

                        prj_entry[day] = this.float(prj_entry[day]) + this.float(entry.hours);
                        total[day] = this.float(total[day]) + this.float(entry.hours);
                    });

                    for (var i = 0; i < 7; i++) {
                        prj_entry.total += this.float(prj_entry[i]);
                    }
                    issues.forEach(issue => {
                        for (var i = 0; i < 7; i++) {
                            issue.total += this.float(issue[i])
                        }
                    });
                    total.total += prj_entry.total;
                    this.data.push(prj_entry);
                    this.data = this.data.concat(issues);
                });
                this.hours = total.total;
                this.data.push(total);
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