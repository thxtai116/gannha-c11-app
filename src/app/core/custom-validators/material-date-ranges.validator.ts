import { ValidatorFn, AbstractControl } from '@angular/forms';

export class MaterialDateRangesValidator {

    static validate(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            let startDate = new Date(control.value['startDate']);
            let endDate = new Date(control.value['endDate']);

            let invalid: any = null;

            if (startDate && endDate) {
                let currDate = new Date();

                if (startDate > endDate) {
                    invalid = { "end_date_must_be_greater_than_start_date": true };
                }
                else
                    if (new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()) <= new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate())) {
                        invalid = { "end_date_must_be_greater_than_current_date": true };
                    }
            }

            return invalid;
        };
    }
}