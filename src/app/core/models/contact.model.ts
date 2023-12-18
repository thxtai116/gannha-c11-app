import { LocaleString, AdministrationType } from "../types/index";

import { PhoneModel } from "./phone.model";

export class ContactModel {
    Administration: AdministrationType = {};

    Website: string = "";

    Street: LocaleString = {
        "vi": ""
    };

    Address: LocaleString = {
        "vi": ""
    };

    Email: string = "";

    Phone: PhoneModel[] = [];

    Areas: string[] = [];

    BuildingId: string = "";

    BuildingName: LocaleString = {
        "vi": ""
    }

    CompanyName: string = "";


    TaxCode: string = "";
}