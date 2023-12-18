import { BaseModel } from "./base/base.model";

import { LocaleString } from "../types/index";

export class BrandFindResultModel extends BaseModel {
    Logo: string = '';

    Name: LocaleString = {
        "vi": ""
    };

    Categories: string[] = [];

    Privilege: { [key: string]: number; };
}