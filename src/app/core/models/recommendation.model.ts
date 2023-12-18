import { BaseModel } from "./base/base.model";

import { LocaleString } from "../types/index";

import { ScheduleRepeatEveryModel } from "./schedule-repeat-every.model";

import { GenericResourceModel } from "./generic-resource.model";

export class RecommendationModel extends BaseModel {
    Name: LocaleString = {
        "vi": ""
    };

    Title: LocaleString = {
        "vi": ""
    };

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    CreatedDate: Date = new Date();

    TimeRanges: any[] = [];

    Repeat: ScheduleRepeatEveryModel = new ScheduleRepeatEveryModel();

    Resources: GenericResourceModel[] = [];

    Order: number = 0;

    Icon: string = "";

    RecommendationType: string = "";
}