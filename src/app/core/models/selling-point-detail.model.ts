import { LocaleString } from '../types/index';

import { ResourceModel } from './resource.model';

import { ButtonOptionModel } from './common/index';

export class SellingPointDetailModel {
    Gallery: ResourceModel[] = [];

    Title: LocaleString = {
        "vi": ""
    };
    FullTitle: LocaleString = {
        "vi": ""
    };
    Description: LocaleString = {
        "vi": ""
    };

    Options: any = {
        AppointmentButton: new ButtonOptionModel(),
        ShareButton: new ButtonOptionModel()
    }
}