import { LocaleString } from '../types';
import { Status } from '../enums';

export class PromotionCodeCampaignModel {
    Id: number = 0;
    Name: LocaleString = {
        "vi": ""
    };
    MessageTemplate: LocaleString = {
        "vi": ""
    };
    Status: Status = Status.Pending;
    ExpiryPeriod: number = 0;
    HasLimited: boolean = false;
    HasLimitedPerUser: boolean = false;
    LimitPerUser: number = 1;
    BrandId: string = "";
    CreatedAt: Date = new Date();
}