import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility } from '../../utilities';

@Injectable()
export class VerificationRequestService {
    private _apiEndpoint = env.service.endpoint + "/verificationrequest";

    constructor(private _http: HttpUtility) { }

    async getStatisticsByBrands(brandIds: Array<string>): Promise<any> {
        let url = `${this._apiEndpoint}/find`;
        let bodyObj = {
            'Brands': brandIds
        }
        let body = JSON.stringify(bodyObj);
        let result = await this._http.post(url, body);

        return this.extractRawUnitsStatistics(brandIds, result);
    }

    // async getStatisticsByBrandId(brandId: string): Promise<any> {
    //     let url: string = `${this._apiEndpoint}?brandId=${brandId}`
    //     let result: any = await this._http.get(url);

    //     return {
    //         Total: result.TotalRawUnits,
    //         SolvedCount: result.TotalSolvedAction,
    //         MapNewInsertCount: result.TotalMapNewInsertAction,
    //         MapNewUpdateCount: result.TotalMapNewUpdateAction,
    //         UpdateCount: result.TotalVerifyUpdateAction,
    //         DeleteCount: result.TotalVerifyDeleteAction
    //     }
    // }

    private extractRawUnitsStatistics(brandIds: Array<string>, rawStats: any[]) {
        let statistics: any = {};
        brandIds.forEach(id => {
            let brand = rawStats.find(x => x.BrandId == id);
            if (brand) {
                statistics[id] = {
                    Total: brand.TotalRawUnits,
                    SolvedCount: brand.TotalSolvedAction,
                    MappingCount: brand.TotalMapNewInsertAction + brand.TotalMapNewUpdateAction,
                    UpdateCount: brand.TotalVerifyUpdateAction,
                    DeleteCount: brand.TotalVerifyDeleteAction
                }
            } else {
                statistics[id] = {
                    Total: 0,
                    SolvedCount: 0,
                    MappingCount: 0,
                    UpdateCount: 0,
                    DeleteCount: 0
                }
            }
        })

        return statistics;
    }
}