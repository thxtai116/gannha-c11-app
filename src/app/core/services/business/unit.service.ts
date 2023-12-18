import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility } from "../../utilities/index";

import { UnitModel, PhoneModel } from "../../models/index";

@Injectable()

export class UnitService {
    private _apiEndpoint = env.service.endpoint + '/units';

    constructor(private _httpUtil: HttpUtility) {
    }

    async get(id: string): Promise<UnitModel> {
        let unit = new UnitModel();
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._httpUtil.get(url);

        if (result) {
            unit = Object.assign(new UnitModel(), result);
        }

        return unit;
    }

    async generateId(): Promise<string> {
        let result = await this._httpUtil.head(this._apiEndpoint);

        let uniqueId = result["UniqueId"] || result["uniqueid"];

        return uniqueId;
    }

    deactivate(id: string) {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._httpUtil.put(url, body);
    }

    activate(id: string) {
        let url = `${this._apiEndpoint}/${id}`;
        let body = JSON.stringify({

            "Status": "Active"
        });

        return this._httpUtil.put(url, body);
    }

    createUnit(unit: UnitModel) {
        let bodyObj = {
            "Id": unit.Id,
            "BrandId": unit.BrandId,
            "Name": unit.Name,
            "Latitude": unit.Latitude,
            "Longitude": unit.Longitude,
            "Contact": {
                "Street": unit.Contact.Street,
                "Address": unit.Contact.Address,
                "Administration": unit.Contact.Administration,
                "Email": unit.Contact.Email,
                "Phone": unit.Contact.Phone,
                "BuildingId": unit.Contact.BuildingId,
                "BuildingName": unit.Contact.BuildingName
            },
            "Timing": {
                "Open": unit.Timing.Open,
                "Close": unit.Timing.Close,
                "Is24H": unit.Timing.Is24H,
                "Specific": unit.Timing.Specific,
            },
            "Utilities": unit.Utilities || []
        };
        let body = JSON.stringify(bodyObj);
        return this._httpUtil.post(this._apiEndpoint, body);
    }

    updateUnitBasicInfo(unit: UnitModel, language: string) {
        var url = `${this._apiEndpoint}/${unit.Id}`;

        this.parsePhones(unit.Contact.Phone, language);

        let bodyObj = {
            "Name": unit.Name,
            "Contact": {
                "Street": unit.Contact.Street,
                "Address": unit.Contact.Address,
                "Administration": unit.Contact.Administration,
                "Email": unit.Contact.Email,
                "Phone": this.parsePhones(unit.Contact.Phone, language),
                "BuildingId": unit.Contact.BuildingId,
                "BuildingName": unit.Contact.BuildingName
            },
            "Timing": {
                "Open": unit.Timing.Open,
                "Close": unit.Timing.Close,
                "Is24H": unit.Timing.Is24H,
                "Specific": unit.Timing.Specific,
            },
            "Utilities": unit.Utilities || []
        };

        let body = JSON.stringify(bodyObj);
        return this._httpUtil.patch(url, body);
    }

    verifyDuplicateUnit(unit: UnitModel): Promise<any> {
        var url = `${this._apiEndpoint}/duplicate`;

        let bodyObj = {
            "BrandId": unit.BrandId,
            "Name": {
                "vi": unit.Name.vi,
            },
            "Id": unit.Id,
            "Latitude": unit.Latitude,
            "Longitude": unit.Longitude,
        };
        let body = JSON.stringify(bodyObj);

        return this._httpUtil.post(url, body);
    }

    updateUnitLocation(unit: UnitModel) {
        var url = `${this._apiEndpoint}/${unit.Id}`;

        let bodyObj = {
            "Contact": {
                "Street": unit.Contact.Street,
                "Address": unit.Contact.Address,
                "Administration": unit.Contact.Administration,
                "Email": unit.Contact.Email,
                "Phone": this.parsePhones(unit.Contact.Phone, "vi"),
                "BuildingId": unit.Contact.BuildingId,
                "BuildingName": unit.Contact.BuildingName
            },
            "Latitude": unit.Latitude,
            "Longitude": unit.Longitude,
        };

        let body = JSON.stringify(bodyObj);
        return this._httpUtil.patch(url, body);
    }

    public async getByIds(ids: string): Promise<UnitModel[]> {
        var url = `${this._apiEndpoint}/find/${ids}`;
        var results = await this._httpUtil.get(url);
        let units: UnitModel[] = [];

        if (results) {
            for (let unit of results) {
                units.push(Object.assign(new UnitModel(), unit));
            }
        }
        return units;
    }

    private parsePhones(phones: PhoneModel[], language: string): PhoneModel[] {
        let parsedPhones = new Array<PhoneModel>();

        for (let phone of phones) {
            let parsedPhone = new PhoneModel();

            parsedPhone.Value = phone.Value;
            parsedPhone.Type = phone.Type;
            parsedPhone.Description[language] = (phone.Description && phone.Description[language]) ? phone.Description[language] : '';

            parsedPhones.push(parsedPhone);
        }

        return parsedPhones;
    }
}