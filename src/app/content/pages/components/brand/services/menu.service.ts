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
            // {
            //     Name: "BRANDS.REPORT",
            //     Href: 'report'
            // },
        ];
    }

    getBrandsReportMenu(): any[]{
        return [
            {
                Name: "BRANDS.MAIN_REPORT",
                Href: 'main-report'
            },
            {
                Name: "BRANDS.UNIT_REPORT",
                Href: 'unit-report'
            },
            {
                Name: "BRANDS.SP_REPORT",
                Href: 'sp-report'
            },
        ];
    }
}