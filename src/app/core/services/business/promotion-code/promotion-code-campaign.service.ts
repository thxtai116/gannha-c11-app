import { Injectable } from '@angular/core';

import { environment as env } from '../../../../../environments/environment';

import { HttpUtility } from '../../../utilities';

import { PromotionCodeCampaignModel, PromotionCustomerModel } from '../../../models';

@Injectable()

export class PromotionCodeCampaignService {
    private _apiEndpoint = `${env.service.promotions}/open/promotions/campaigns`;

    constructor(
        private _http: HttpUtility
    ) {
    }

    async getAll(): Promise<PromotionCodeCampaignModel[]> {
        let models: PromotionCodeCampaignModel[] = [];
        let result = await this._http.get(this._apiEndpoint);

        if (result) {
            for (let item of result) {
                models.push(Object.assign(new PromotionCodeCampaignModel(), item));
            }
        }

        return models;
    }

    async get(id: number): Promise<PromotionCodeCampaignModel> {
        let model = new PromotionCodeCampaignModel();
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._http.get(url);

        if (result) {
            model = Object.assign(new PromotionCodeCampaignModel(), result);
        }

        return model;
    }

    async getCustomers(id: number): Promise<PromotionCustomerModel[]> {
        let models: PromotionCustomerModel[] = [];
        let url = `${this._apiEndpoint}/${id}/customers`;
        let result = await this._http.get(url);

        if (result) {
            for (let item of result) {
                models.push(Object.assign(new PromotionCodeCampaignModel(), item));
            }
        }

        return models;
    }

    async apply(promotionId: number, customerId: number): Promise<PromotionCustomerModel[]> {
        let url = `${this._apiEndpoint}/${promotionId}/customers/${customerId}/apply`;
        return await this._http.put(url);
    }
}