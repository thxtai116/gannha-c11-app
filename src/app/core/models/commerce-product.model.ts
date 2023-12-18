import { BaseModel } from './base/base.model';

import { CommerceProductType } from '../enums';

export class CommerceProductModel extends BaseModel {
    Name: string = "";

    ShortDescription: string = "";

    FullDescription: string = "";

    ProductType: number = CommerceProductType.Single;

    Sku: string = "";

    AutomaticallyAddRequiredProducts: boolean = false;

    IsShipEnabled: boolean = false;

    IsFreeShipping: boolean = false;

    ShipSeparately: boolean = false;

    AdditionalShippingCharge: number = 0;

    OrderMinimumQuantity: number = 0;

    OrderMaximumQuantity: number = 10;

    NotReturnable: boolean = false;

    CallForPrice: boolean = false;

    Price: number = 0;

    OldPrice: number = 0;

    ProductCost: number = 0;

    Picture: string = "";

    MarkAsNew: boolean = false;

    Published: boolean = false;

    DisplayOrder: boolean = false;

    Categories: string[] = [];
}