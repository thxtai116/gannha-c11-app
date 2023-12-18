export class MenuService {
    getTrendDetailMenu(): any[] {
        return [
            {
                Name: "TRENDS.BASIC_INFO",
                Href: 'basic-info'
            },
            {
                Name: "TRENDS.RESOURCES",
                Href: 'resources'
            }
        ];
    }
}