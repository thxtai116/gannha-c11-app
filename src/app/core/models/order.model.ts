import { BaseModel } from './base/base.model';
import { LocaleString } from '../core.module';

export class OrderModel extends BaseModel {

    Code: string = "";

    Guid: string = "";

    UnitId: string = "";

    CustomerId: string = "";

    PickupAddressId: number = 0;

    PickupInStore: boolean = false;

    OrderStatusId: number = 0;

    PaymentStatusId: number = 0;

    OrderSubtotal: number = 0.0;

    OrderSubTotalDiscount: number = 0.0;

    OrderShipping: number = 0.0;

    OrderDiscount: number = 0.0;

    OrderTotal: number = 0.0;

    ShippingStatusId: number = 0

    UnitName: LocaleString = {};

    OrderStatus: number = 0;

    PaymentStatus: number = 0;

    ShippingStatus: number = 0;

    Customer: any = {
        UserId: "",
        FullName: "",
        Email: "",
        PhoneNumber: "",
    };

    Shipping: any = {
        PickupInStore: true,
        Address: '',
        Fee: 0.0,
        Latitude: 0.0,
        Longitude: 0.0
    }

    OrderNotes: OrderNoteModel[] = [];

    OrderItems: OrderItemModel[] = [];

    BrandId: string = "";

    DeliveryDistance: number = 0;
}

export class OrderNoteModel extends BaseModel {
    OrderId: number = 0;

    Note: string = "";

    DisplayToCustomer: boolean = false;

    //Obsolete
    // Deleted: boolean = false;
}

export class OrderItemModel extends BaseModel {
    Guid: string = "";
    OrderId: number = 0;
    ProductId: number = 0;
    Quantity: number = 0;

    UnitPrice: number = 0.0;
    Price: number = 0.0;
    DiscountAmount: number = 0.0;

    Product: {
        Name: "",
        Sku: "",
        Picture: "",
        ProductType: 0,
        Categories: [],
        Id: 0,
    }

    //Obsolete
    // OriginalProductCost: number = 0.0;
    // TenantId: string = "";
    // ClientId: string = "";
}