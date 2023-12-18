import { ValidatorFn, AbstractControl } from "@angular/forms";
import { ShiftModel } from "../core.module";
import { DateTimeUtility } from "../utilities";

export class ValidTime {
    private static _dateTimeUtil: DateTimeUtility;

    static validate(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } => {
            let shifts: ShiftModel[] = control.value;

            for (let shift of shifts) {
                if (!this.isValidShift(shift)) {
                    return null;
                }
            }
            return { "validTime": true };
        };
    }

    private static isValidShift(shift: ShiftModel): boolean {
        if (shift.Active && !shift.AllDay && shift.Specifics.length > 1) {
            let firstOpenTime: Date = this._dateTimeUtil.convertStringToTime(shift.Specifics[0].Open);
            let firstCloseTime: Date = this._dateTimeUtil.convertStringToTime(shift.Specifics[0].Close);

            let secondOpenTime: Date = this._dateTimeUtil.convertStringToTime(shift.Specifics[1].Open);
            let secondCloseTime: Date = this._dateTimeUtil.convertStringToTime(shift.Specifics[1].Close);

            if ((secondOpenTime < firstOpenTime && secondOpenTime < firstCloseTime && secondCloseTime < firstOpenTime && secondCloseTime < firstCloseTime) ||
                (secondOpenTime > firstOpenTime && secondOpenTime > firstCloseTime && secondCloseTime > firstOpenTime && secondCloseTime > firstCloseTime)) {
                return true;
            } else {
                return false;
            }
        }

        return true;
    }
}