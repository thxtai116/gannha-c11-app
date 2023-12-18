import { BaseModel } from './base/base.model';

export class DiscountModel extends BaseModel {
    Name: string = "";

    DiscountType: number = 0;

    Description: string = "";

    UsePercentage: boolean = true;

    DiscountPercentage: number = 0;

    DiscountAmount: number = 0;

    MaximumDiscountAmount: number;

    MaximumDiscountedQuantity: number;

    DiscountLimitation: string = "";

    RequiresCouponCode: boolean = false;

    CouponCode: string = "";

    AssignedToEntities: number[] = [];

    CreatedAt: Date = new Date();

    StartDate: string = "";

    EndDate: string = "";
}