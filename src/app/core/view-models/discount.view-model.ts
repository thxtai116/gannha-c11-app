import { BaseModel } from '../models/base/base.model';

export class DiscountViewModel extends BaseModel {
    Name: string = "";

    DiscountType: number = 0;

    DiscountAmount: number = 0;

    UsePercentage: boolean = true;

    DiscountPercentage: number = 0;

    Status: number = 0;

    CreatedAt: Date = new Date();

    StartDate: Date = new Date();

    EndDate: Date = new Date();
}