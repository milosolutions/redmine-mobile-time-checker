import { Page, NavController, NavParams, Storage, LocalStorage } from 'ionic-angular';
import { SettingsPage } from '../settings/settings'

@Page({
    templateUrl: 'build/pages/report/report.html'
})
export class ReportPage {
    static get parameters() {
        return [[NavController], [NavParams]];
    }

    constructor(nav, navParams) {
        this.nav = nav;
        this.local = new Storage(LocalStorage);
        this.getReport();
    }

    getReport(){
        this.data = [
            {project: "prj1",issue:"very long name",mo:"3",tu:"0.75",we:"5",th:"1.75", fr:"1", sa: "", su: "", total: "11.5"},
            {project: "prj2",issue:"very very very loooong name",mo:"3",tu:"9.25",we:"",th:"", fr:"6", sa: "2.5", su: "", total: "20.75"},
            {project: "",issue:"name of an issue",mo:"2",tu:"",we:"3",th:"0.25", fr:"", sa: "4.5", su: "", total: "9.75"},
            {project: "Total",issue:"",mo:"8",tu:"10",we:"8",th:"2", fr:"7", sa: "5", su: "", total: "42"}
        ]
    }

    onPageWillEnter() {
        this.key = this.local.get('key')._result;
        this.hours = this.local.get('hours_curr')._result;
    }

    refresh(event){
        this.getReport();
    }

    settings(event){
        this.nav.push(SettingsPage);
    }
}