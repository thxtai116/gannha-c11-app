import { BaseModel } from "./base/base.model";

import { LocaleString } from "../types/index";

import { SellingPointDetailModel } from './selling-point-detail.model';

import { ResourceModel } from "./resource.model";

import { ContactModel } from "./contact.model";

import { TimingModel } from "./timing.model";
import { GnActionModel } from "./gn-action.model";

export class BrandModel extends BaseModel {
    Logo: string = '';

    Marker: string = "";

    Name: LocaleString = {
        "vi": ""
    };

    Description: LocaleString = {
        "vi": ""
    };

    SellingPoint: SellingPointDetailModel = new SellingPointDetailModel();

    Categories: string[] = [];

    CategoryNames: Array<LocaleString> = [];

    NumberOfUnits: number = 0;

    Gallery: ResourceModel[] = [];

    Background: ResourceModel[] = [];

    Tags: string[] = [];

    Contact: ContactModel = new ContactModel();

    Utilities: string[] = [];

    Timing: TimingModel = new TimingModel();

    Actions: GnActionModel[] = [];

    Properties: string[] = [];


}