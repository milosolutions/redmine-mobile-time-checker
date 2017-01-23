export function runSettingsAlert(setting, alertCtrl, local) {
    let type = setting.name == 'vacation' ? 'date' : 'text';
    let prompt = alertCtrl.create({
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
                            let alert = alertCtrl.create({
                                title: 'Incorrect end vacation date!',
                                buttons: ['OK']
                            });
                            alert.present();
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
    prompt.present();
}
