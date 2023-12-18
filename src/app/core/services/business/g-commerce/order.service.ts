import { Injectable } from '@angular/core';

import { environment as env } from "../../../../../environments/environment"

import { HttpUtility } from '../../../utilities';

import { QueryResultsModel, OrderModel } from '../../../models';

@Injectable()
export class OrderService {

    private _apiEndpoint = env.service.gnCommerce;

    constructor(
        private _http: HttpUtility,
    ) { }

    async getAll(): Promise<OrderModel[]> {
        let url = `${this._apiEndpoint}/orders`;
        let orders: OrderModel[] = [];
        let result = await this._http.get(url);

        for (let item of result) {
            orders.push(Object.assign(new OrderModel(), item));
        }

        return orders;
    }

    async getByBrand(query: string): Promise<QueryResultsModel> {
        let url = query.length > 0 ? `${this._apiEndpoint}/orders?${query}` : `${this._apiEndpoint}/orders`;

        let models = new QueryResultsModel();
        let result = await this._http.get(url);

        if (result) {
            for (let item of result.items) {
                models.items.push(Object.assign(new OrderModel(), item));
            }

            models.totalCount = result.total;
        }

        return models;
    }

    async getDetails(id: string): Promise<OrderModel> {
        let order = new OrderModel();
        let url = `${this._apiEndpoint}/orders/${id}`;
        let result = await this._http.get(url);

        if (result) {
            order = Object.assign(new OrderModel(), result);
        }

        return order;
    }

    async updateOrderStatus(id: string, status: number): Promise<any> {
        let url = `${this._apiEndpoint}/orders/${id}/status`;

        let bodyObj = {
            Value: status
        }

        let body = JSON.stringify(bodyObj);

        return this._http.put(url, body);
    }

    async createNote(note: any = {}) {
        let url = `${this._apiEndpoint}/orders/${note.OrderId}/notes`;

        let bodyObj = {
            "Note": note.Note,
            "DisplayToCustomer": note.DisplayToCustomer
        }

        let body = JSON.stringify(bodyObj);

        //Return new Id
        return this._http.post(url, body);
    }
}
