export class MenuService {
    getBrandsDetailMenu(): any[] {
        return [
            {
                Name: "BRANDS.BASIC_INFO",
                Href: 'basic-info'
            },
            {
                Name: "BRANDS.DEFAULT_SELLING_POINT",
                Href: 'default-selling-point'
            },
            {
                Name: "BRANDS.MANAGERS",
                Href: 'managers'
            }
        ];
    }

    getUnitsDetailMenu(brandId: string, unitId: string): any[] {
        return [
            {
                Name: "UNITS.BASIC_INFO",
                Href: `/brands/${brandId}/units/${unitId}/basic-info`
            },
            {
                Name: "UNITS.LOCATION",
                Href: `/brands/${brandId}/units/${unitId}/location`
            },
            {
                Name: "UNITS.REPORT",
                Href: `/brands/${brandId}/units/${unitId}/report`
            }
        ];
    }

    getSellingPointsDetailMenu(brandId: string, spId: string): any[] {
        return [
            {
                Name: "SELLING_POINTS.BASIC_INFO",
                Href: `/brands/${brandId}/selling-points/${spId}/basic-info`
            }
        ];
    }
}