import { Injectable } from '@angular/core';
import { HttpUtility } from "../../utilities/index";

import { environment as env } from '../../../../environments/environment';

import {
    UtilityModel
} from "../../models/index";

@Injectable()

export class UtilityService {
    private _apiEndpoint = env.service.endpoint + "/catalog/utilities";
    private _utilities: UtilityModel[] = [];

    constructor(private _httpUtil: HttpUtility) {
    }

    create(utility: UtilityModel): Promise<UtilityModel> {
        let bodyObj = {
            "Name": utility.Name,
            "Description": utility.Description,
            "Icon": utility.Icon
        };

        let body = JSON.stringify(bodyObj);

        return this._httpUtil.post(this._apiEndpoint, body);
    }

    update(utility: UtilityModel): Promise<UtilityModel> {
        var url = `${this._apiEndpoint}/${utility.Id}`;

        let bodyObj = {
            "Name": utility.Name,
            "Description": utility.Description,
            "Icon": utility.Icon
        };

        let body = JSON.stringify(bodyObj);

        return this._httpUtil.patch(url, body);
    }

    reset() {
        this._utilities = [];
    }

    async get(id: string): Promise<UtilityModel> {
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._httpUtil.get(url);

        return Object.assign(new UtilityModel(), result);
    }

    async getAll(reset: boolean = false): Promise<UtilityModel[]> {
        let utilities: UtilityModel[] = [];

        if (reset) {
            this.reset();
        }

        if (this._utilities.length === 0) {
            var result = await this._httpUtil.get(this._apiEndpoint);

            if (result) {
                for (let uti of result) {
                    utilities.push(Object.assign(new UtilityModel(), uti));
                }
            }

            this._utilities = utilities;
        }
        else {
            utilities = this._utilities;
        }

        return utilities;
    }
}