export class MenuService {
    getCollectionsDetailMenu(): any[] {
        return [
            {
                Name: "COLLECTIONS.BASIC_INFO",
                Href: 'basic-info'
            },
            {
                Name: "COLLECTIONS.RESOURCES",
                Href: 'resources'
            }
        ];
    }
}