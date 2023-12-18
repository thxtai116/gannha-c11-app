import { ResourceType, Status } from "../enums/index";

export class ResourceModel {
    Id: string | number;

    Type: ResourceType;

    TypeName: string = "";

    Url: string = "";

    Thumbnail: string = "";

    Order: number = 0;

    Status: Status = Status.Pending;

    Uploader: any;
}