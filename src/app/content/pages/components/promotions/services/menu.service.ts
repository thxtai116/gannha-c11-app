export class MenuService {
    getPromotionsDetailMenu(): any[] {
        return [
            // {
            //     Name: "PROMOTIONS.BASIC_INFO",
            //     Href: 'basic-info'
            // },
            {
                Name: "PROMOTION_CODE.CUSTOMERS",
                Href: 'customer'
            },           
        ];
    }  
}