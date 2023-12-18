import { BaseModel } from "./base/base.model";

import { LocaleString } from "../types/index";

import { ContactModel } from "./contact.model";

import { TimingModel } from "./timing.model";

export class PlaceModel extends BaseModel {
    Name: LocaleString = {
        "vi": ""
    };
    
    Latitude: number = 0;

    Longitude: number = 0;

    Contact: ContactModel = new ContactModel();

    Timing: TimingModel = new TimingModel();

    CreatedDate: Date = new Date();

    Verified: boolean = false;
}
