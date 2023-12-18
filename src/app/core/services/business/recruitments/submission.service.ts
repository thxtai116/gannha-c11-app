import { Injectable } from '@angular/core';

import { environment as env } from '../../../../../environments/environment';

import { SubmissionModel, QueryResultsModel } from '../../../models';

import { HttpUtility } from '../../../utilities';

@Injectable()

export class SubmissionService {
    private _apiEndpoint = env.service.endpoint_vnext + "/recruitments/v1/resumes";

    constructor(
        private _http: HttpUtility) {
    }

    async updateStatus(id: string, status: number, reason: string[] = []): Promise<any> {
        let url = `${this._apiEndpoint}/${id}/status`;

        let bodyObj = {
            Id: status,
            Reason: reason
        }

        let body = JSON.stringify(bodyObj);

        return this._http.put(url, body);
    }

    async getAll(jobId: string | number, pageIndex: number = 0, pageSize: number = 10): Promise<QueryResultsModel> {
        let url = `${this._apiEndpoint}?jobId=${jobId}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

        let models = new QueryResultsModel();
        let result = await this._http.get(url);

        if (result) {
            for (let item of result.Items) {
                models.items.push(Object.assign(new SubmissionModel(), item));
            }

            models.totalCount = result.TotalItems;
        }

        return models;
    }

    async getById(id: string): Promise<SubmissionModel> {
        let order = new SubmissionModel();
        let url = `${this._apiEndpoint}/${id}`;
        let result = await this._http.get(url);

        if (result) {
            order = Object.assign(new SubmissionModel(), result);
        }

        return order;
    }

    async getSampleReasons(): Promise<string[]> {
        let url = `${this._apiEndpoint}/reason`;
        return await this._http.get(url);  
    }
}