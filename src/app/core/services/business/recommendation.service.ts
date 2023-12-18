import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, DateTimeUtility } from "../../utilities/index";

import { RecommendationModel } from "../../models/index";

@Injectable()

export class RecommendationService {
    private _apiEndpoint = env.service.endpoint + '/recommendations';

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility) {
    }

    async getAll(): Promise<RecommendationModel[]> {
        let recommendations: RecommendationModel[] = [];

        let results: any[] = await this._http.get(this._apiEndpoint);
        if (results) {
            for (let recommendation of results) {
                recommendations.push(Object.assign(new RecommendationModel(), recommendation));
            }
        }

        return recommendations;
    }

    async get(id: string, includeResources: boolean = false): Promise<RecommendationModel> {
        let model = new RecommendationModel();
        let url = `${this._apiEndpoint}/${id}?includeResources=${includeResources}`;
        let result = await this._http.get(url);

        if (result) {
            model = Object.assign(new RecommendationModel(), result);
        }

        return model;
    }

    updateBasicInfo(model: RecommendationModel): Promise<RecommendationModel> {
        var url = `${this._apiEndpoint}/${model.Id}`;

        let bodyObj = {
            "Name": model.Name,
            "Title": model.Title,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(model.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(model.EndDate),
            "TimeRanges": model.TimeRanges,
            "Repeat": model.StartDate.toDateString() !== model.EndDate.toDateString() ? model.Repeat : null,
            "Order": model.Order,
            "Icon": model.Icon,
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    updateResource(model: RecommendationModel): Promise<RecommendationModel> {
        var url = `${this._apiEndpoint}/${model.Id}`;

        let bodyObj = {
            "Resources": model.Resources,
            "RecommendationType": model.RecommendationType
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    create(model: RecommendationModel): Promise<RecommendationModel> {
        let bodyObj = {
            "Name": model.Name,
            "Title": model.Title,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(model.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(model.EndDate),
            "TimeRanges": model.TimeRanges,
            "Repeat": model.StartDate.toDateString() !== model.EndDate.toDateString() ? model.Repeat : null,
            "Resources": model.Resources,
            "Order": model.Order,
            "Icon": model.Icon,
            "RecommendationType": model.RecommendationType
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    deactivate(id: string): Promise<RecommendationModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._http.put(url, body);
    }

    activate(id: string): Promise<RecommendationModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Active"
        });

        return this._http.put(url, body);
    }
}