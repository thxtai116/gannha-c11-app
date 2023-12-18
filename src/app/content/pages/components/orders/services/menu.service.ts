export class MenuService {
    getOrdersDetailMenu(orderId: string): any[] {
        return [
            {
                Name: "ORDERS.BASIC_INFO",
                Href: `/orders/${orderId}/basic-info`
            },
            {
                Name: "ORDERS.NOTES",
                Href: `/orders/${orderId}/notes`
            },
        ]
    }
}