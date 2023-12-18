import { Injectable } from '@angular/core';

import {
    ShiftModel,
    SpecificTimingModel,
    TimingModel
} from "../models/index";

import { DayOfWeekType } from "../types/index";

import { DayOfWeek } from "../enums/index";

import { DateTimeUtility } from "./date-time.utility";
import { CommonUtility } from "./common.utility";

@Injectable()

export class ShiftsUtility {
    private _days: any[] = [];

    constructor(
        private _dateTimeUtil: DateTimeUtility,
        private _commonUtil: CommonUtility) {
        this._days = this._commonUtil.parseEnumToList(DayOfWeek);
    }

    convert24hToShifts(): ShiftModel[] {
        let shifts: ShiftModel[] = []
        let specific: SpecificTimingModel = new SpecificTimingModel("08:00:00", "22:00:00", true);

        for (var day of this._days) {
            let shift = new ShiftModel();

            shift.Name = day.value;
            shift.Active = true;
            shift.AllDay = true;
            shift.Specifics[0] = specific;
            shifts.push(shift);
        }

        return shifts;
    }

    convertOfficeHoursToShifts(timing: TimingModel): ShiftModel[] {
        let shifts: ShiftModel[] = []
        let specific: SpecificTimingModel = new SpecificTimingModel(timing.Open, timing.Close, false);

        for (var day of this._days) {
            let shift = new ShiftModel();

            shift.Name = day.value;
            shift.Active = true;
            shift.AllDay = false;
            shift.Specifics[0] = specific;
            shifts.push(shift);
        }

        return shifts;
    }

    convertDayOfWeekToShifts(specifics: DayOfWeekType = {}): ShiftModel[] {
        let shifts: ShiftModel[] = [];

        for (let day of this._days) {
            let spec = specifics[day.value];

            if (spec) {
                let shift: ShiftModel = this.convertSpecificTimingToShift(day.value, spec);

                shifts.push(shift);
            } else {
                let shift: ShiftModel = new ShiftModel();

                shift.Name = day.value;
                shift.Specifics.push(new SpecificTimingModel());

                shifts.push(shift);
            }
        }

        return shifts;
    }

    convertShiftsToSpecificTiming(shifts: ShiftModel[]): TimingModel {
        let timing: TimingModel = new TimingModel();

        timing.Open = "08:00:00";
        timing.Close = "22:00:00";

        for (let shift of shifts) {
            if (shift.Active) {
                if (shift.AllDay) {
                    let spec: SpecificTimingModel = new SpecificTimingModel();

                    spec.Is24H = true;

                    timing.Specific[shift.Name] = [spec];
                } else {
                    timing.Specific[shift.Name] = shift.Specifics;
                }
            }
        }

        return timing;
    }

    convertShiftsToDayOfWeek(shifts: ShiftModel[]): DayOfWeekType {
        let data: DayOfWeekType = {}


        for (let shift of shifts) {
            if (shift.Active) {
                if (shift.AllDay) {
                    let spec: SpecificTimingModel = new SpecificTimingModel();

                    spec.Open = "08:00:00";
                    spec.Close = "22:00:00";
                    spec.Is24H = true;

                    data[shift.Name] = [spec];
                } else {
                    data[shift.Name] = shift.Specifics;
                }
            }
        }

        return data;
    }

    validate(shifts: ShiftModel[]): boolean {
        for (let shift of shifts) {
            if (!this.isValidShift(shift)) {
                return false;
            }
        }

        return true;
    }

    private convertSpecificTimingToShift(name: string, specifics: SpecificTimingModel[]): ShiftModel {
        let shift: ShiftModel = new ShiftModel();

        shift.Name = name;
        shift.Specifics = specifics;
        shift.Active = shift.Specifics.length > 0;
        shift.AllDay = shift.Specifics.length > 0 && shift.Specifics[0].Is24H;

        return shift;
    }

    private isValidShift(shift: ShiftModel): boolean {
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