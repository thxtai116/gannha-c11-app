import { AbstractControl } from '@angular/forms';

export class MatchPassword {

    static validate(AC: AbstractControl) {
        let password = AC.get('NewPassword').value;
        let confirmPassword = AC.get('ConfirmNewPassword').value;

        if (password != confirmPassword) {
            AC.get('ConfirmNewPassword').setErrors({ MatchPassword: true });
        } else {
            AC.get('ConfirmNewPassword').setErrors(null);
        }
    }
}