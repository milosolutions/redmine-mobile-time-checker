import { Alert, AlertController } from 'ionic-angular'

export function runSettingsAlert(setting, nav, local) {
    this.alertCtrl = AlertController;
    let type = setting.name == 'vacation' ? 'date' : 'text';
    let prompt = this.alertCtrl.create({
        title: setting.message,
        inputs: [
            {
                name: setting.name,
                placeholder: setting.placeholder,
                type: type,
                value: setting.value
            }
        ],

        buttons: [
            {
                text: 'Save',
                cssClass: 'confirm',
                handler: data => {
                    if (setting.name == 'vacation'){
                        let validate = new Date(data[setting.name]) > new Date();
                        if (!validate) {
                            setting.toggled = false;
                            let alert = this.alertCtrl.create({
                                title: 'Incorrect end vacation date!',
                                buttons: ['OK']
                            });
                            nav.present(alert);
                            return
                        }
                        setting.date = new Date(data[setting.name]);
                    } else if (setting.name == 'hours_week'){
                        let reg = /^\d+(.\d+)?$/;
                        if (!reg.test(data[setting.name])){
                            return
                        }
                        setting.current = data[setting.name];
                        setting.value = data[setting.name];
                    }

                    local.set(setting.name, data[setting.name]);
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'dismiss',
                handler: () => {
                    if (setting.name == 'vacation')
                        setting.toggled = false;
                }
            }
        ]
    });
    nav.present(prompt);
}
