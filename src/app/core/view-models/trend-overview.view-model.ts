import { Status } from "../enums/index";

export class TrendOverviewViewModel {
    Id: string = "";

    Name: string = "";

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    Status: Status;
}