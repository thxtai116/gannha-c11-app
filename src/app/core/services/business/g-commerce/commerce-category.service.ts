import { Injectable } from "@angular/core";

import { environment as env } from '../../../../../environments/environment';

import { HttpUtility } from '../../../utilities';

import { CommerceCategoryModel } from '../../../models';

@Injectable()

export class CommerceCategoryService {
    private _apiEndpoint = `${env.service.gnCommerce}/categories`;

    constructor(
        private _http: HttpUtility
    ) {
    }

    async getAll(): Promise<CommerceCategoryModel[]> {
        let models: CommerceCategoryModel[] = [];
        let result = await this._http.get(this._apiEndpoint);

        if (result) {
            for (let item of result) {
                models.push(Object.assign(new CommerceCategoryModel(), item));
            }
        }

        return models;
    }

    async get(id: string): Promise<CommerceCategoryModel> {
        let model = new CommerceCategoryModel();
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._http.get(url);

        if (result) {
            model = Object.assign(new CommerceCategoryModel(), result);
        }

        return model;
    }

    async create(model: CommerceCategoryModel): Promise<any> {
        let bodyObj = {
            "Name": model.Name,
            "Published": model.Published,
            "DisplayOrder": model.DisplayOrder,
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    async update(model: CommerceCategoryModel): Promise<any> {
        let url = `${this._apiEndpoint}/${model.Id}`;

        let bodyObj = {
            "Name": model.Name,
            "Published": model.Published,
            "DisplayOrder": model.DisplayOrder,
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }
}