import { Status } from '../enums';

export class PromotionCustomerViewModel {
    Id: number = 0;

    Code: string = "";

    PhoneNumber: string = "";

    Status: Status = Status.Pending;

    ExpiredAt: Date = new Date();
}