import { LocaleString } from "../types/locale-string.type";
import { BaseModel } from "./base/base.model";

export class AdministrativeModel extends BaseModel {
    Name: LocaleString = {
        "vi": ""
    };

    AppId: string = "";

    ParentId: string = "";
}