import { Injectable } from "@angular/core";

import { environment as env } from '../../../../../environments/environment';

import { HttpUtility } from '../../../utilities';

@Injectable()

export class JobTitleService {
    private _apiEndpoint = env.service.endpoint_vnext + "/recruitments/v1/jobtitles";
    private _jobTitles: any[] = [];

    constructor(
        private _http: HttpUtility) {
    }

    async getAll(reset: boolean = false): Promise<any[]> {
        let jobTypes: any[] = [];

        if (reset) {
            this._jobTitles = [];
        }

        if (this._jobTitles.length === 0) {


            let results: any[] = await this._http.get(this._apiEndpoint);

            if (results) {
                for (let entity of results) {
                    jobTypes.push(entity);
                }
            }

            this._jobTitles = jobTypes;
        } else {
            jobTypes = this._jobTitles;
        }

        return jobTypes;
    }
}