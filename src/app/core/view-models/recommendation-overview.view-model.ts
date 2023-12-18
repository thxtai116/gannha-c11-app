import { Status } from "../enums/index";

export class RecommendationOverviewViewModel {
    Id: string = "";

    Name: string = "";

    Title: string = "";

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    Status: Status;
}