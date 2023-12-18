import { ValidatorFn, AbstractControl } from '@angular/forms';

export class DateRangesValidator {

    static validate(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            let ranges = control.value as any[];
            let invalid: any = null;

            if (ranges.length > 1 && ranges.length < 3) {
                let startDate = new Date(ranges[0]);
                let endDate = new Date(ranges[1]);
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