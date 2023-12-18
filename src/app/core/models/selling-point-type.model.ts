import { BaseModel } from "./base/base.model";
import { LocaleString } from "../types/locale-string.type";

export class SellingPointTypeModel extends BaseModel {
    Name: LocaleString = {
        "vi": ""
    };

    Description: LocaleString = {
        "vi": ""
    };

    Icon: string[] = [];

    Color: string = "";
}