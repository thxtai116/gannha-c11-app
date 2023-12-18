import { ValidatorFn, AbstractControl } from "@angular/forms";

export class ValidUrl {
    static validate(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            let url: string = control.value.toLowerCase();

            if (url.indexOf('facebook.com') !== -1) {
                return { "validUrl": false };
            }
            if (url.indexOf('fb.com') !== -1) {
                return { "validUrl": false };
            }
            if (url.indexOf('bitly.com') !== -1) {
                return { "validUrl": false };
            }

            return null;
        }
    }
}