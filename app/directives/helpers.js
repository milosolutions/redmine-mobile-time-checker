import { Alert } from 'ionic-angular'

export function runSettingsAlert(setting, nav, local) {
    let type = setting.name == 'vacation' ? 'date' : 'text';
    let prompt = Alert.create({
        message: setting.message,
        inputs: [
            {
                name: setting.name,
                placeholder: setting.placeholder,
                type: type
            }
        ],
        buttons: [
            {
                text: 'Cancel',
                handler: data => {
                    console.log('Cancel clicked');
                }
            },
            {
                text: 'Save',
                handler: data => {
                    local.set(setting.name, data[setting.name]);
                    if (setting.name == 'vacation')
                        console.log(data)
                }
            }
        ]
    });
    nav.present(prompt);
}
