import { BaseModel } from "./base/base.model";

import { SellingPointDetailModel } from "./selling-point-detail.model";

import { ScheduleRepeatEveryModel } from "./schedule-repeat-every.model";

import { ResourceModel } from "./resource.model";

import { Status } from "../enums/index";

import { GnActionModel } from "./gn-action.model";

export class SellingPointModel extends BaseModel {
    Id: string = "";

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    TimeRanges: any[] = [];

    Repeat: ScheduleRepeatEveryModel = new ScheduleRepeatEveryModel();

    Detail: SellingPointDetailModel = new SellingPointDetailModel();

    BrandId: string = "";

    Units: string[] = [];

    Icon: string = "";

    Gallery: ResourceModel[] = [];

    Status: Status;

    Order: number = 0;

    Actions: GnActionModel[] = [];

    Tags: string[] = [];

    _code: string = "";

    IsSpecial: boolean = false;
}