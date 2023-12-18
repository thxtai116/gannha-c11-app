import { ScheduleEveryType, ScheduleOnType } from "../consts/index";

export class ScheduleRepeatEveryModel {
    constructor() {
        this.OnType = ScheduleOnType.Day;
        this.EveryType = ScheduleEveryType.Daily;
        this.Every = 1;
    }

    Every: number = 1;

    EveryType: string = "";

    OnType: string = "";

    On: number[] = [];
}