import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';
import { HttpUtility, DateTimeUtility } from '../../utilities';
import { QueryResultsModel, DiscountModel } from '../../models';

@Injectable()

export class DiscountService {
    private _apiEndpoint = env.service.gnCommerce;

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility,
    ) {
    }

    async getAll(): Promise<DiscountModel[]> {
        let url = `${this._apiEndpoint}/discounts`
        let discounts: DiscountModel[] = [];
        let result = await this._http.get(url);

        if (result) {
            for (let item of result) {
                discounts.push(Object.assign(new DiscountModel(), item));
            }
        }

        return discounts;
    }

    async getById(id: string): Promise<DiscountModel> {
        let url = `${this._apiEndpoint}/discounts/${id}`;
        let discount = new DiscountModel();
        let result = await this._http.get(url);

        if (result) {
            discount = Object.assign(new DiscountModel(), result);
        }

        return discount;
    }

    async create(obj: DiscountModel) {
        let url = `${this._apiEndpoint}/discounts`;

        let bodyObj = this.parseModelToBodyObject(obj);

        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }

    async update(obj: DiscountModel) {
        let url = `${this._apiEndpoint}/discounts/${obj.Id}`;

        let bodyObj = {
            "Name": obj.Name,
            "Description": obj.Description
        }

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    private parseModelToBodyObject(discount: DiscountModel): any {
        let bodyObj: any = {};

        bodyObj.Name = discount.Name;
        bodyObj.DiscountType = discount.DiscountType.toString();
        bodyObj.Description = discount.Description;
        bodyObj.UsePercentage = discount.UsePercentage;

        if (bodyObj.UsePercentage) {
            bodyObj.DiscountPercentage = discount.DiscountPercentage;
        } else {
            bodyObj.DiscountAmount = discount.DiscountAmount;
        }
        bodyObj.MaximumDiscountAmount = discount.MaximumDiscountAmount || null;
        bodyObj.MaximumDiscountedQuantity = discount.MaximumDiscountedQuantity || null;

        bodyObj.RequiresCouponCode = discount.RequiresCouponCode;
        if (bodyObj.RequiresCouponCode) {
            bodyObj.CouponCode = discount.CouponCode;
        }

        bodyObj.DiscountLimitation = discount.DiscountLimitation;

        bodyObj.AssignedToEntities = discount.AssignedToEntities;
        bodyObj.StartDate = this._dateTimeUtil.convertDateWithUTC(new Date(discount.StartDate));
        bodyObj.EndDate = this._dateTimeUtil.convertDateWithUTC(new Date(discount.EndDate));

        return bodyObj;
    }
}