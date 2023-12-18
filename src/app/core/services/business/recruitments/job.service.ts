import { Injectable } from "@angular/core";

import { environment as env } from '../../../../../environments/environment';

import { HttpUtility, DateTimeUtility } from '../../../utilities';

import { JobModel, SubmissionModel, JobOptionalFields } from '../../../models';

@Injectable()

export class JobService {
    private _apiEndpoint = env.service.endpoint_vnext + "/recruitments/v1/jobs";

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility
    ) { }

    async get(id: any): Promise<JobModel> {
        let url = `${this._apiEndpoint}/${id}`;
        let job = new JobModel();
        let result = await this._http.get(url);

        if (result) {
            Object.assign(job, result);

            job.Id = job.Id.toString();
            job.Campaign.Id = job.Campaign.Id.toString();
        }

        return job;
    }

    async getSubmissions(id: string): Promise<SubmissionModel[]> {
        let url = `${this._apiEndpoint}/${id}/submissions`;
        let results: any[] = await this._http.get(url);
        let subs: SubmissionModel[] = [];

        if (results) {
            for (let item of results) {
                var sub: SubmissionModel = Object.assign(new SubmissionModel(), item);

                subs.push(sub);
            }
        }

        return subs;
    }

    async getOptionalFields(): Promise<JobOptionalFields> {
        let url = `${this._apiEndpoint}/options`;

        return await this._http.get(url);
    }

    update(job: JobModel): Promise<any> {
        var url = `${this._apiEndpoint}/${job.Id}`;

        let bodyObj = {
            "Title": job.Title,
            "Demands": job.Demands,
            "Description": job.Description,
            "Requirements": job.Requirements,
            "WorkingAddress": job.WorkingAddress,
            "JobTypes": job.JobTypes,
            "JobBenefits": job.JobBenefits,
            "Salary": job.Salary,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(job.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(job.EndDate),
            "Campaign": {
                "Id": job.Campaign.Id,
                "Title": job.Campaign.Title
            },
            "BrandId": job.BrandId,
            "RequireSubmitFields": job.RequireSubmitFields,
            "JobTitles": job.JobTitles,
            "Units": job.Units
        };

        let body = JSON.stringify(bodyObj);

        return this._http.patch(url, body);
    }

    create(job: JobModel): Promise<any> {
        let bodyObj = {
            "Title": job.Title,
            "Demands": job.Demands,
            "Description": job.Description,
            "Requirements": job.Requirements,
            "WorkingAddress": job.WorkingAddress,
            "JobTypes": job.JobTypes,
            "JobBenefits": job.JobBenefits,
            "Salary": job.Salary,
            "StartDate": this._dateTimeUtil.convertDateWithUTC(job.StartDate),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(job.EndDate),
            "Campaign": {
                "Id": job.Campaign.Id,
                "Title": job.Campaign.Title
            },
            "BrandId": job.BrandId,
            "RequireSubmitFields": job.RequireSubmitFields,
            "JobTitles": job.JobTitles,
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    deactivate(id: string) {
        let url = `${this._apiEndpoint}/${id}/deactivate`;

        return this._http.put(url, null);
    }

    activate(id: string) {
        let url = `${this._apiEndpoint}/${id}/active`;

        return this._http.put(url);
    }
}