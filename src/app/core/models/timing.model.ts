import { DayOfWeekType } from "../types/day-of-week.type";

export class TimingModel {
    Open: string = '09:00:00';
    Close: string = '22:00:00';
    Is24H: boolean = false;
    Specific: DayOfWeekType = {};
}