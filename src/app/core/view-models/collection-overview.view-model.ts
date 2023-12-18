import { Status } from "../enums/index";

export class CollectionOverviewViewModel {
    Id: string = "";

    Title: string = "";

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    Status: Status;
}