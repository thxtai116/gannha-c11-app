import { LocaleString } from "../types/locale-string.type";
import { BaseModel } from "./base/base.model";

export class CategoryModel extends BaseModel {
    AppId: string = "";

    ParentId: string = "";

    Order: number = 0;

    Name: LocaleString = {
        "vi": "",
        "en": ""
    };

    Description: LocaleString = {
        "vi": ""
    };

    Tags: string[] = [];

    Subordinate: string[] = [];

    Searchable: boolean = false;

    PublicService: boolean = false;

    Icon: string[] = [];

    Childs: CategoryModel[] = [];

    Image: string = "";
};