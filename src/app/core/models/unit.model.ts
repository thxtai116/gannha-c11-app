import { BaseModel } from "./base/base.model";
import { LocaleString } from "../types/index";

import { ResourceModel } from "./resource.model";

import { TimingModel } from "./timing.model";

import { ContactModel } from "./contact.model";

import { BrandModel } from "./brand.model";

export class UnitModel extends BaseModel {
    Name: LocaleString = {
        "vi": ""
    };

    Description: LocaleString = {
        "vi": ""
    };

    Gallery: ResourceModel[] = [];

    BrandId: string = "";

    Timing: TimingModel = new TimingModel();

    Contact: ContactModel = new ContactModel();

    Latitude: number = 0;

    Longitude: number = 0;

    Utilities: string[] = [];

    Brand: BrandModel = new BrandModel();

    //For OrdersModule

    OrdersCount: number = 0;
}