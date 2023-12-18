import { ValidatorFn, AbstractControl } from "@angular/forms";

export class ValidPhone {
    static validate(country_code: string = 'VN'): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            let number: string = control.value;
            return !(/^(0\d{9})$/.test(number)) ? { "validPhoneNumber": true } : null;
        }
    }

}