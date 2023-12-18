import { Injectable } from "@angular/core";

import { environment as env } from '../../../../../environments/environment';

import { HttpUtility } from '../../../utilities';

@Injectable()

export class JobTypeService {
    private _apiEndpoint = env.service.endpoint_vnext + "/recruitments/v1/jobtypes";
    private _jobTypes: string[] = [];

    constructor(
        private _http: HttpUtility) {
    }

    async getAll(reset: boolean = false): Promise<string[]> {
        let jobTypes: string[] = [];

        if (reset) {
            this._jobTypes = [];
        }

        if (this._jobTypes.length === 0) {


            let results: any[] = await this._http.get(this._apiEndpoint);

            if (results) {
                for (let entity of results) {
                    jobTypes.push(entity);
                }
            }

            this._jobTypes = jobTypes;
        } else {
            jobTypes = this._jobTypes;
        }

        return jobTypes;
    }
}