import { Status } from "../../enums/status.enum";

export class BaseModel {
    Id: string = "";

    Status: Status = Status.Pending;

    CreatedAt: Date = new Date();

    UpdatedAt: Date = new Date();
}