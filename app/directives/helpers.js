import { Alert } from 'ionic-angular'

export function runSettingsAlert(setting, nav, local) {
    let type = setting.name == 'vacation' ? 'date' : 'text';
    if (setting.name == 'vacation' && setting.toggled){
        local.remove(setting.name);
        return
    }
    let prompt = Alert.create({
        title: setting.message,
        cssClass: 'alert-'+setting.name,
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
                cssClass: 'fa fa-check confirm',
                handler: data => {
                    if (setting.name == 'vacation'){
                        let validate = new Date(data[setting.name]) > new Date();
                        if (!validate) {
                            setting.toggled = false;
                            return
                        }
                    } else if (setting.name == 'hours_week'){
                        let reg = /^\d+(.\d+)?$/;
                        if (!reg.test(data[setting.name])){
                            return
                        }
                        setting.current = data[setting.name];
                    }
                    local.set(setting.name, data[setting.name]);
                }
            },
            {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'fa fa-ban dismiss',
                handler: data => {
                    if (setting.name == 'vacation')
                        setting.toggled = false;
                }
            }
        ]
    });
    nav.present(prompt);
}
