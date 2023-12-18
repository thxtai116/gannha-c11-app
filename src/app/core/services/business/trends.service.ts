import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, DateTimeUtility } from "../../utilities/index";

import { TrendModel } from "../../models/index";

@Injectable()

export class TrendService {
    private _apiEndpoint = env.service.endpoint + '/trendings';

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility) {
    }

    async getAll(): Promise<TrendModel[]> {
        let trends: TrendModel[] = [];

        let results: any[] = await this._http.get(this._apiEndpoint);
        if (results) {
            for (let trend of results) {
                trends.push(Object.assign(new TrendModel(), trend));
            }
        }
        return trends;
    }

    create(model: TrendModel): Promise<TrendModel> {
        let bodyObj = {
            "Name": model.Name,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(model.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(model.EndDate),
            "TimeRanges": model.TimeRanges,
            "Repeat": model.StartDate.toDateString() !== model.EndDate.toDateString() ? model.Repeat : null,
            "Resources": model.Resources,
            "Order": model.Order
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    updateResources(model: TrendModel): Promise<TrendModel> {
        var url = `${this._apiEndpoint}/${model.Id}`;

        let bodyObj = {
            "Resources": model.Resources
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    updateBasicInfo(model: TrendModel): Promise<TrendModel> {
        var url = `${this._apiEndpoint}/${model.Id}`;

        let bodyObj = {
            "Name": model.Name,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(model.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(model.EndDate),
            "TimeRanges": model.TimeRanges,
            "Repeat": model.StartDate.toDateString() !== model.EndDate.toDateString() ? model.Repeat : null,
            "Order": model.Order
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    async get(id: string, includeResources: boolean = false): Promise<TrendModel> {
        let url = `${this._apiEndpoint}/${id}?includeResources=${includeResources}`;
        let result = await this._http.get(url);
        let model: TrendModel = Object.assign(new TrendModel(), result)

        model.StartDate = this._dateTimeUtil.convertStringToDateUTC(model.StartDate.toString(), 7);
        model.EndDate = this._dateTimeUtil.convertStringToDateUTC(model.EndDate.toString(), 7);

        return model;
    }

    deactivate(id: string): Promise<TrendModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._http.put(url, body);
    }

    activate(id: string): Promise<TrendModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Active"
        });

        return this._http.put(url, body);
    }
}