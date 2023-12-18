import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, DateTimeUtility } from "../../utilities/index";

import { CollectionModel } from "../../models/index";

@Injectable()

export class CollectionService {
    private _apiEndpoint = env.service.endpoint + '/collections';

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility) {
    }

    async getAll(): Promise<CollectionModel[]> {
        let collections: CollectionModel[] = [];
        let results: any[] = await this._http.get(this._apiEndpoint);

        if (results) {
            for (let collection of results) {
                collections.push(Object.assign(new CollectionModel(), collection));
            }
        }

        return collections;
    }

    async getByIds(ids: string[]): Promise<CollectionModel[]> {
        let url = `${this._apiEndpoint}/find`;
        let body = JSON.stringify(ids);
        let results = await this._http.post(url, body);
        let collections: CollectionModel[] = [];

        if (results) {
            for (let collection of results) {
                collections.push(Object.assign(new CollectionModel(), collection));
            }
        }

        return collections;
    }

    async get(id: string): Promise<CollectionModel> {
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._http.get(url);
        let model = new CollectionModel();

        if (result) {
            model = Object.assign(new CollectionModel(), result);
        }

        return model;
    }

    create(model: CollectionModel): Promise<CollectionModel> {
        let bodyObj = {
            "Title": model.Title,
            "Description": model.Description,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(model.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(model.EndDate),
            "TimeRanges": model.TimeRanges,
            "Repeat": model.StartDate.toDateString() !== model.EndDate.toDateString() ? model.Repeat : null,
            "Resources": model.Resources,
            "Gallery": model.Gallery.filter(x => x.Url.length > 0) || [],
            "Order": model.Order,
            "Views": model.Views
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    updateBasicInfo(model: CollectionModel): Promise<CollectionModel> {
        let url = `${this._apiEndpoint}/${model.Id}`;

        let bodyObj = {
            "Title": model.Title,
            "Description": model.Description,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(model.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(model.EndDate),
            "TimeRanges": model.TimeRanges,
            "Repeat": model.StartDate.toDateString() !== model.EndDate.toDateString() ? model.Repeat : null,
            "Gallery": model.Gallery.filter(x => x.Url.length > 0) || [],
            "Order": model.Order,

            "Views": model.Views
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    updateResources(model: CollectionModel): Promise<CollectionModel> {
        let url = `${this._apiEndpoint}/${model.Id}`;

        let bodyObj = {
            "Resources": model.Resources
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    deactivate(id: string): Promise<CollectionModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._http.put(url, body);
    }

    activate(id: string): Promise<CollectionModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Active"
        });

        return this._http.put(url, body);
    }
}