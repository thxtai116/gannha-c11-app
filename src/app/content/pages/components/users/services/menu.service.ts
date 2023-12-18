export class MenuService {
    getUserDetailMenu(): any[] {
        return [
            {
                Name: "USERS.BASIC_INFO",
                Href: 'basic-info'
            },
            {
                Name: "USERS.ASSIGNMENTS",
                Href: 'assignments'
            }
        ];
    }
}