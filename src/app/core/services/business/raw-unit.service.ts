import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { RawUnitModel } from '../../models';

import { HttpUtility } from '../../utilities';
import { Status } from '../../enums';

@Injectable()
export class RawUnitService {
    private _apiEndpoint = env.service.endpoint + "/merchantunits";

    constructor(private _http: HttpUtility) { }

    async getAll(brandId: string): Promise<RawUnitModel[]> {
        let url: string = `${this._apiEndpoint}/${brandId}/units`
        let results: any[] = await this._http.get(url);
        let units: RawUnitModel[] = [];

        if (results) {
            for (let unit of results) {
                units.push(Object.assign(new RawUnitModel(), unit));
            }
        }
        return units;
    }

    async getByActionCode(brandId: string, actionCode: string): Promise<RawUnitModel[]> {
        let url = (actionCode == "All") ? `${this._apiEndpoint}/${brandId}/units` : `${this._apiEndpoint}/${brandId}/units?ActionCode=${actionCode}`;
        let result = await this._http.get(url);
        let rawUnits: RawUnitModel[] = [];

        if (result) {
            for (let unit of result) {
                rawUnits.push(Object.assign(new RawUnitModel(), unit));
            }
        }
        return rawUnits;
    }

    async getBrandsStatistics(brandIds: Array<string>) {
        let url = `${this._apiEndpoint}`;
        let body = [];

        brandIds.forEach(brandId => {
            body.push(brandId);
        });

        let bodyObj = JSON.stringify(body);

        let result = await this._http.post(url, bodyObj);

        return this.extractStatisticsByBrand(result);
    }

    markRawUnitAsRead(rawUnit: RawUnitModel): Promise<any> {
        let url: string = `${this._apiEndpoint}/${rawUnit.BrandId}/units/${rawUnit.Id}/read`;

        return new Promise((resolve) => {
            if (rawUnit.Status != Status.Active) {
                resolve(this._http.put(url));
            } else {
                resolve(undefined);
            }
        })
    }

    markIssueAsRead(rawUnit: RawUnitModel) {
        let url: string = `${this._apiEndpoint}/${rawUnit.BrandId}/units/${rawUnit.Id}/issues/read`;
        return this._http.put(url);
    }

    markAsDeleted(brandId: string, rawUnitId: string): Promise<any> {
        let url: string = `${this._apiEndpoint}/${brandId}/units/${rawUnitId}/delete`;
        return this._http.delete(url);
    }

    markAsSolved(brandId: string, rawUnitId: string, referenceId: string): Promise<any> {
        let url: string = `${this._apiEndpoint}/${brandId}/units/${rawUnitId}/resolve`;
        let bodyObj = {
            'ReferenceId': referenceId,
        }
        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }

    async getById(brandId: string, rawUnitId: string): Promise<RawUnitModel> {
        let url: string = `${this._apiEndpoint}/${brandId}/units/${rawUnitId}`
        let result = await this._http.get(url);

        return Object.assign(new RawUnitModel(), result);
    }

    private extractStatisticsByBrand(brands: any): any {
        let result: any = {}
        brands.forEach(brand => {
            result[brand.BrandId] = {
                SolvedCount: brand.Statistics.Solved || 0,
                MapNewInsertCount: brand.Statistics.MapNewInsert || 0,
                MapNewUpdateCount: brand.Statistics.MapNewUpdate || 0,
                UpdateCount: brand.Statistics.VerifyUpdate || 0,
                DeleteCount: brand.Statistics.VerifyDelete || 0,
            }
        })
        return result;
    }
}