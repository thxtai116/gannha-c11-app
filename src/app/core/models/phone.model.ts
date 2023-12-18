import { LocaleString } from "../types/index";
import { PhoneType } from "../enums/index";

export class PhoneModel {
    Value: string = "";

    Description: LocaleString = {
        "vi": ""
    };

    Type: PhoneType = PhoneType.Phone;
}