import { Status } from "../enums/index";
import { ResourceModel } from '../models/resource.model';
import { ScheduleRepeatEveryModel, GnActionModel } from '../models';

export class SellingPointOverviewViewModel {
    Id: string = "";

    Title: string = "";

    Actions: GnActionModel[] = [];

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    Status: Status;

    BrandId: string = "";

    BrandName: string = "";

    Pictures: ResourceModel[] = [];

    Repeat: ScheduleRepeatEveryModel = new ScheduleRepeatEveryModel();
}