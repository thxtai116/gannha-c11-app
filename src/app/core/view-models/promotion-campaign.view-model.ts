import { Status } from '../enums';

export class PromotionCampaignViewModel {
    Id: number = 0;

    Name: string = "";

    Status: Status = Status.Pending;

    CreatedAt: Date = new Date();
}