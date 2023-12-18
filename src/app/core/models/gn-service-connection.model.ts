import { BaseModel } from "./base/base.model";

import { LocaleString } from "../types/index";

export class GnServiceConnectionModel extends BaseModel {
    Name: string = "";

    ActionType: string = "";

    Type: string = "";

    Priority: number = 0;

    Layout: string = "";

    Title: LocaleString = {
        "vi": ""
    };

    Icon: string = "";

    RequireLogin: boolean = false;

    IsFullScreen: boolean = false;

    RequireParameters: any[] = [];

    Parameters: any = {};
}