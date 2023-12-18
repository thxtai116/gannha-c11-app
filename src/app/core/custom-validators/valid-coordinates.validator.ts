import { ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { CoordinateModel } from '../models';

export class ValidCoordinates {
    static validate(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            let cord: CoordinateModel = control.value;

            if (cord.Latitude == 0 || cord.Longitude == 0) {
                return { 'invalidCoordinates': { value: control.value } }
            }
            return null;
        };
    }
}