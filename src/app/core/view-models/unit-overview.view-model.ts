import { Status } from "../enums/index";

export class UnitOverviewViewModel {
    Id: string = "";

    Name: string = "";

    Address: string = "";

    Status: Status;

    BrandId: string = "";

    BrandName: string = "";

    Country: string = "";

    Province: string = "";

    District: string = "";

    Ward: string = "";

    Latitude: number = 0;

    Longitude: number = 0;
}