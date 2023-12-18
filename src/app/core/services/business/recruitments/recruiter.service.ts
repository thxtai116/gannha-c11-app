import { Injectable } from '@angular/core';

import { HttpUtility } from '../../../utilities';

import { RecruiterModel, QueryResultsModel } from '../../../models';

import { environment as env } from "../../../../../environments/environment";

@Injectable()
export class RecruiterService {
    private _apiEndpoint = env.service.endpoint_vnext + "/recruitments/v1/recruiters";

    constructor(
        private _http: HttpUtility
    ) {

    }

    async getAll(pageIndex: number = 0, pageSize: number = 10): Promise<QueryResultsModel> {
        let url = `${this._apiEndpoint}?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        let models = new QueryResultsModel();
        let result = await this._http.get(url);

        if (result) {
            for (let item of result.Items) {
                models.items.push(Object.assign(new RecruiterModel(), item));
            }

            models.totalCount = result.TotalItems;
        }

        return models;
    }

    async get(id: string = ""): Promise<RecruiterModel> {
        let url = `${this._apiEndpoint}/${id}`;
        let result: any[] = await this._http.get(url);
        let rec: RecruiterModel = new RecruiterModel();

        if (result) {
            rec = Object.assign(new RecruiterModel(), result);
        }

        return rec;
    }

    create(rec: RecruiterModel): Promise<any> {
        let bodyObj = {
            "Title": rec.Title,
            "Name": rec.Name,
            "Email": rec.Email,
            "PhoneNumber": rec.PhoneNumber
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    update(rec: RecruiterModel): Promise<any> {
        var url = `${this._apiEndpoint}/${rec.Id}`;

        let bodyObj = {
            "Title": rec.Title,
            "Name": rec.Name,
            "Email": rec.Email,
            "PhoneNumber": rec.PhoneNumber
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    delete(id: string): Promise<any> {
        var url = `${this._apiEndpoint}/${id}`;

        return this._http.delete(url);
    }
}