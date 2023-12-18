import { Injectable } from "@angular/core";

import { environment as env } from '../../../../../environments/environment';

import { HttpUtility } from '../../../utilities';

@Injectable()

export class JobBenefitService {
    private _apiEndpoint = env.service.endpoint_vnext + "/recruitments/v1/jobbenefits";
    private _jobBenefits: string[] = [];

    constructor(
        private _http: HttpUtility) {
    }

    async getAll(reset: boolean = false): Promise<string[]> {
        let jobBenefits: string[] = [];

        if (reset) {
            this._jobBenefits = [];
        }

        if (this._jobBenefits.length === 0) {


            let results: any[] = await this._http.get(this._apiEndpoint);

            if (results) {
                for (let entity of results) {
                    jobBenefits.push(entity);
                }
            }

            this._jobBenefits = jobBenefits;
        } else {
            jobBenefits = this._jobBenefits;
        }

        return jobBenefits;
    }
}