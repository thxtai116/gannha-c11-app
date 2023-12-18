import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility } from "../../utilities/index";

import { CategoryModel } from "../../models/index";

@Injectable()

export class CategoryService {
    private _apiEndpoint = `${env.service.endpoint}/categories`;
    private _categories: CategoryModel[] = [];

    constructor(
        private _httpUtil: HttpUtility) {
    }

    async getAll(reset: boolean = false): Promise<CategoryModel[]> {
        let categories: CategoryModel[] = [];

        if (reset) {
            this._categories = [];
        }

        if (this._categories.length === 0) {
            var result = await this._httpUtil.get(this._apiEndpoint);

            if (result) {
                for (let cat of result) {
                    categories.push(Object.assign(new CategoryModel(), cat));
                }
            }

            this._categories = categories;
        }
        else {
            categories = this._categories;
        }

        return categories;
    }

    // async delete(id: string) {
    //     var url = `${this._apiEndpoint}/${id}`;
    //     return this._httpUtil.delete(url);
    // }

    create(cat: CategoryModel): Promise<CategoryModel> {
        let bodyObj = {
            "Name": cat.Name,
            "Description": cat.Description,
            "Searchable": true,
            "PublicService": cat.PublicService,
            "Icon": cat.Icon,
            "Tags": cat.Tags,
            "Order": cat.Order,
            "AppId": cat.AppId,
            "Image": cat.Image
        };

        if (cat.ParentId.length > 0) {
            bodyObj["ParentId"] = cat.ParentId;
        }

        let body = JSON.stringify(bodyObj);

        return this._httpUtil.post(this._apiEndpoint, body);
    }

    update(cat: CategoryModel): Promise<CategoryModel> {
        var url = `${this._apiEndpoint}/${cat.Id}`;

        let bodyObj = {
            "Name": cat.Name,
            "Description": cat.Description,
            "Searchable": true,
            "PublicService": cat.PublicService,
            "Icon": cat.Icon,
            "Tags": cat.Tags,
            "Order": cat.Order,
            "Image":cat.Image
        };

        if (cat.ParentId.length > 0) {
            bodyObj["ParentId"] = cat.ParentId;
        }

        let body = JSON.stringify(bodyObj);

        return this._httpUtil.patch(url, body);
    }

    async get(id: string): Promise<CategoryModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let result = await this._httpUtil.get(url);

        return Object.assign(new CategoryModel(), result);
    }

    deactivate(id: string): Promise<CategoryModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._httpUtil.put(url, body);
    }

    activate(id: string): Promise<CategoryModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Active"
        });

        return this._httpUtil.put(url, body);
    }
}