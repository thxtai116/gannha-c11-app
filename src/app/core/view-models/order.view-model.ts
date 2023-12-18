import { BaseModel } from '../models';

export class OrderViewModel extends BaseModel {
    OrderStatus: number = 0;

    // PaymentStatus: number = 0;

    // ShippingStatus: number = 0;

    Customer: string = "";

    UnitName: string = "";

    // OrderSubtotalInclTax: number = 0;
    // OrderSubtotalExclTax: number = 0;

    // OrderSubTotalDiscountInclTax: number = 0;
    // OrderSubTotalDiscountExclTax: number = 0;

    // OrderShippingInclTax: number = 0;
    // OrderShippingExclTax: number = 0;

    // OrderTax: number = 0;
    // OrderDiscount: number = 0;
    OrderTotal: number = 0;
}