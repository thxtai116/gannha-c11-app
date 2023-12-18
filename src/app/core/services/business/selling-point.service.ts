import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, DateTimeUtility } from "../../utilities/index";

import { SellingPointModel } from "../../models/index";
import { ProductSeries } from '../../consts/product-series.const';

@Injectable()

export class SellingPointService {
    private _apiEndpoint = env.service.endpoint + '/sellingpoints';

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility
    ) {
    }

    async searchByBrand(ids: string[], fromDate: Date, toDate: Date, fromHour: number, toHour: number): Promise<SellingPointModel[]> {
        let url = `${this._apiEndpoint}/filter`;
        let bodyObj: any = {
            Brands: ids,
            FromDate: fromDate,
            ToDate: toDate,
            FromHour: fromHour,
            ToHour: toHour,
        };
        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }

    async searchByTag(tag: string, fromDate: Date, toDate: Date, fromHour: number, toHour: number): Promise<SellingPointModel[]> {
        let url = `${this._apiEndpoint}/filter`;
        let bodyObj: any = {
            Tag: tag,
            FromDate: fromDate,
            ToDate: toDate,
            FromHour: fromHour,
            ToHour: toHour,
        };
        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }

    async getByIds(ids: string[]): Promise<SellingPointModel[]> {
        let url = `${this._apiEndpoint}/find`;
        let body = JSON.stringify({
            "SellingPoints": ids
        });
        let results = await this._http.post(url, JSON.parse(JSON.stringify(body)));
        let sps: SellingPointModel[] = [];

        if (results) {
            for (let item of results) {
                let sp = Object.assign(new SellingPointModel(), item);
                sps.push(sp)
            }
        }

        return sps;
    }

    async get(id: string): Promise<SellingPointModel> {
        let sellingPoint = new SellingPointModel();
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._http.get(url);

        if (result) {
            sellingPoint = Object.assign(new SellingPointModel(), result);
        }

        return sellingPoint;
    }

    async generateId(): Promise<string> {
        let result = await this._http.head(this._apiEndpoint);

        let uniqueId = result["UniqueId"] || result["uniqueid"];

        return uniqueId;
    }

    create(sellingPoint: SellingPointModel): Promise<SellingPointModel> {
        let bodyObj: any = {};

        bodyObj = this.getBrandSellingPointBody(sellingPoint);

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    update(sellingPoint: SellingPointModel) {
        var url = `${this._apiEndpoint}/${sellingPoint.Id}`;

        let bodyObj: any = {};

        bodyObj = this.getBrandSellingPointBody(sellingPoint);

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    deactivate(id: string) {
        let url = `${this._apiEndpoint}/${id}`;

        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._http.put(url, body);
    }

    activate(id: string) {
        let url = `${this._apiEndpoint}/${id}`;
        let body = JSON.stringify({

            "Status": "Active"
        });

        return this._http.put(url, body);
    }

    private getBrandSellingPointBody(sp: SellingPointModel): any {
        return {
            "Id": sp.Id,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(sp.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(sp.EndDate),
            "TimeRanges": sp.TimeRanges,
            "BrandId": sp.BrandId,
            "Units": sp.Units,
            "Gallery": sp.Gallery.filter(x => x.Url.length > 0) || [],
            "Detail": sp.Detail,
            "Repeat": sp.StartDate.toDateString() !== sp.EndDate.toDateString() ? sp.Repeat : null,
            "Icon": sp.Icon,
            "Order": sp.Order,
            "Tags": sp.Tags,
            "AppId": ProductSeries.Brand,
            "Actions": sp.Actions
        };
    }
}