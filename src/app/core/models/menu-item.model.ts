export class MenuItemModel {
    Name: string = "";

    Href: string = "";

    Childs: MenuItemModel[] = [];

    Icon: string = "";

    Type: number = 0;

    Description: string = "";

    DisplayIndex: number = 0;

    Active: boolean = false;

    Parameter: string = "";
}