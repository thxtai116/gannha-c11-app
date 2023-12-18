import { Injectable } from "@angular/core";

import { environment as env } from '../../../../../environments/environment';

import { HttpUtility } from '../../../utilities';

import { CommerceProductModel } from '../../../models';

@Injectable()

export class CommerceProductService {
    private _apiEndpoint = `${env.service.gnCommerce}/products`;

    constructor(
        private _http: HttpUtility
    ) {
    }

    async getAll(): Promise<CommerceProductModel[]> {
        let models: CommerceProductModel[] = [];
        let result = await this._http.get(this._apiEndpoint);

        if (result) {
            for (let item of result) {
                models.push(Object.assign(new CommerceProductModel(), item));
            }
        }

        return models;
    }

    async get(id: string): Promise<CommerceProductModel> {
        let model = new CommerceProductModel();
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._http.get(url);

        if (result) {
            model = Object.assign(new CommerceProductModel(), result);
        }

        return model;
    }

    async create(model: CommerceProductModel): Promise<any> {
        let bodyObj = {
            "Name": model.Name,
            "Sku": model.Sku,
            "ShortDescription": model.ShortDescription,
            "FullDescription": model.FullDescription,
            "Price": model.Price,
            "OldPrice": model.OldPrice,
            "Picture": model.Picture,
            "ProductType": +model.ProductType,
            "MarkAsNew": model.MarkAsNew,
            "Published": model.Published,
            "DisplayOrder": model.DisplayOrder,
            "Categories": model.Categories.map(x => +x),
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    async update(model: CommerceProductModel): Promise<any> {
        let url = `${this._apiEndpoint}/${model.Id}`;

        let bodyObj = {
            "Name": model.Name,
            "Sku": model.Sku,
            "ShortDescription": model.ShortDescription,
            "FullDescription": model.FullDescription,
            "Price": model.Price,
            "OldPrice": model.OldPrice,
            "Picture": model.Picture,
            "ProductType": +model.ProductType,
            "MarkAsNew": model.MarkAsNew,
            "Published": model.Published,
            "DisplayOrder": model.DisplayOrder,
            "Categories": model.Categories.map(x => +x),
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }
}