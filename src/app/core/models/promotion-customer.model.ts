import { LocaleString } from '../types';
import { Status } from '../enums';

export class PromotionCustomerModel {
    Code: string = "";
    CampaignId: number = 0;
    ClaimBy: string = "";
    FromSpId: string = "";
    Status: Status = Status.Pending;
    ExpiredAt: Date = new Date();
    PhoneNumber: string = "";
    Id: number = 0;
    CreatedAt: Date = new Date();
}