import { BaseModel } from "./base/base.model";

import { ScheduleRepeatEveryModel } from "./schedule-repeat-every.model";

import { LocaleString } from "../types/locale-string.type";

import { GenericResourceModel } from "./generic-resource.model";

export class TrendModel extends BaseModel {
    Name: LocaleString = {
        "vi": ""
    };

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    TimeRanges: any[] = [];

    Repeat: ScheduleRepeatEveryModel = new ScheduleRepeatEveryModel();

    Resources: GenericResourceModel[] = [];

    Order: number = 0;

    Image: string []=[];
}