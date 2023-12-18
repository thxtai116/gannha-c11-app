import { BaseModel } from './base/base.model';

export class NotificationCampaignModel extends BaseModel {
    NotificationType: string = "";

    Seen: number = 0;

    Total: number = 0;

    Content: any = {
        Content: "",
        Icon: "",
        Image: "",
        Title: ""
    }

    ExecuteAt: Date = new Date();
}