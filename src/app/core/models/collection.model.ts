import { BaseModel } from "./base/base.model";

import { LocaleString } from "../types/index";

import { GenericResourceModel } from "./generic-resource.model";

import { ResourceModel } from "./resource.model";

import { ScheduleRepeatEveryModel } from "./schedule-repeat-every.model";

export class CollectionModel extends BaseModel {
    Title: LocaleString = {
        "vi": ""
    };

    Description: LocaleString = {
        "vi": ""
    };

    Categories: string[] = [];

    Tags: string[] = [];

    Resources: GenericResourceModel[] = [];

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    Gallery: ResourceModel[] = [];

    Order: number = 1;

    CreatedDate: Date = new Date();

    TimeRanges: any[] = [];

    Repeat: ScheduleRepeatEveryModel = new ScheduleRepeatEveryModel();

    Views: number = Math.floor((Math.random() * 2000) + 1); 
}