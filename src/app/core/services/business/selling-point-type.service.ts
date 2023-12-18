import { Injectable } from '@angular/core';
import { HttpUtility } from "../../utilities/index";

import { environment as env } from '../../../../environments/environment';

import {
    SellingPointTypeModel
} from "../../models/index";

@Injectable()

export class SellingPointTypeService {
    private _apiEndpoint = env.service.endpoint + "/catalog/sptype";
    private _spTypes: SellingPointTypeModel[] = [];

    constructor(private _httpUtil: HttpUtility) {
    }

    create(spType: SellingPointTypeModel): Promise<SellingPointTypeModel> {
        let bodyObj = {
            "Name": spType.Name,
            "Description": spType.Description,
            "Icon": spType.Icon,
            "Color": spType.Color
        };

        let body = JSON.stringify(bodyObj);

        return this._httpUtil.post(this._apiEndpoint, body);
    }

    update(spType: SellingPointTypeModel): Promise<SellingPointTypeModel> {
        var url = `${this._apiEndpoint}/${spType.Id}`;

        let bodyObj = {
            "Name": spType.Name,
            "Description": spType.Description,
            "Icon": spType.Icon,
            "Color": spType.Color
        };

        let body = JSON.stringify(bodyObj);

        return this._httpUtil.patch(url, body);
    }

    reset() {
        this._spTypes = [];
    }

    async get(id: string): Promise<SellingPointTypeModel> {
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._httpUtil.get(url);

        return Object.assign(new SellingPointTypeModel(), result);
    }

    async getAll(reset: boolean = false): Promise<SellingPointTypeModel[]> {
        let spTypes: SellingPointTypeModel[] = [];

        if (reset) {
            this.reset();
        }

        if (this._spTypes.length === 0) {
            var result = await this._httpUtil.get(this._apiEndpoint);

            if (result) {
                for (let uti of result) {
                    spTypes.push(Object.assign(new SellingPointTypeModel(), uti));
                }
            }

            this._spTypes = spTypes;
        }
        else {
            spTypes = this._spTypes;
        }

        return spTypes;
    }
}