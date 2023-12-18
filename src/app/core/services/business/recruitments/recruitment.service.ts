import { Injectable } from "@angular/core";

import { HttpUtility, DateTimeUtility } from '../../../utilities';

import { RecruitmentModel, JobModel, QueryResultsModel, Interview, SubmissionModel } from '../../../models';

import { environment as env } from "../../../../../environments/environment";

@Injectable()

export class RecruitmentService {
    private _apiEndpoint = env.service.endpoint_vnext + "/recruitments/v1";

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility
    ) {

    }

    async getAll(): Promise<RecruitmentModel[]> {
        let url = `${this._apiEndpoint}/campaigns`;
        let results: any[] = await this._http.get(url);
        let recs: RecruitmentModel[] = [];

        if (results) {
            for (let item of results) {
                let rec: RecruitmentModel = Object.assign(new RecruitmentModel(), item);

                rec.Id = rec.Id.toString();

                recs.push(rec);
            }
        }

        return recs;
    }

    async getAllWithPaging(pageIndex: number = 0, pageSize: number = 10): Promise<QueryResultsModel> {
        let url = `${this._apiEndpoint}/campaigns?pageIndex=${pageIndex}&pageSize=${pageSize}`;

        let models = new QueryResultsModel();
        let result = await this._http.get(url);

        if (result) {
            for (let item of result.Items) {
                models.items.push(Object.assign(new RecruitmentModel(), item));
            }

            models.totalCount = result.TotalItems;
        }

        return models;
    }

    async getJobs(id: string | number): Promise<JobModel[]> {
        let url = `${this._apiEndpoint}/jobs?campaignId=${id}`;
        let results: any[] = await this._http.get(url);
        let jobs: JobModel[] = [];

        if (results) {
            for (let item of results) {
                let job: JobModel = Object.assign(new JobModel(), item);

                job.Id = job.Id.toString();

                jobs.push(job);
            }
        }

        return jobs;
    }

    async getJobsWithPaging(id: string | number, pageIndex: number = 0, pageSize: number = 10): Promise<QueryResultsModel> {
        let url = `${this._apiEndpoint}/jobs?campaignId=${id}&pageIndex=${pageIndex}&pageSize=${pageSize}`;

        let models = new QueryResultsModel();
        let result = await this._http.get(url);

        if (result) {
            for (let item of result.Items) {
                models.items.push(Object.assign(new JobModel(), item));
            }

            models.totalCount = result.TotalItems;
        }

        return models;
    }

    async getSubmissions(campaign: string | number, unit: string, job: string, statuses: number[], pageIndex: number = 0, pageSize: number = 10): Promise<QueryResultsModel> {
        let campaignQuery = campaign ? `&campaignId=${campaign}` : "";
        let unitQuery = unit && unit.length > 0 ? `&unitId=${unit}` : "";
        let jobQuery = job && job.length > 0 ? `&jobId=${job}` : "";
        let statusesQuery = statuses && statuses.length > 0 ? statuses.map(x => `&status=${x}`).join('') : "";
        let url = `${this._apiEndpoint}/resumes?pageIndex=${pageIndex}&pageSize=${pageSize}${campaignQuery}${unitQuery}${jobQuery}${statusesQuery}`;

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

    async getInterviews(unitId: string, active: boolean = true, pageIndex: number = 0, pageSize: number = 10): Promise<QueryResultsModel> {
        let url = `${this._apiEndpoint}/interviews?unitId=${unitId}&active=${active}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
        let models = new QueryResultsModel();
        let result = await this._http.get(url);

        if (result) {
            for (let item of result.Items) {
                models.items.push(Object.assign(new Interview(), item));
            }

            models.totalCount = result.TotalItems;
        }

        return models;
    }

    async get(id: string = ""): Promise<RecruitmentModel> {
        let url = `${this._apiEndpoint}/campaigns/${id}`;
        let result: any[] = await this._http.get(url);
        let rec: RecruitmentModel = new RecruitmentModel();

        if (result) {
            rec = Object.assign(new RecruitmentModel(), result);
        }

        return rec;
    }

    create(rec: RecruitmentModel): Promise<RecruitmentModel> {
        let bodyObj = {
            "Id": rec.Id,
            "Title": rec.Title,
            "Jobs": rec.Jobs
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(this._apiEndpoint, body);
    }

    async createInterview(interview: Interview): Promise<object> {
        let url = `${this._apiEndpoint}/interviews`;

        let bodyObj = {
            "IsOnline": interview.IsOnline,
            "Latitude": interview.Latitude,
            "Longitude": interview.Longitude,
            "Note": interview.Note,
            "Location": interview.Location,
            "ResumeId": interview.ResumeId,
            "Time": interview.Time,
        };

        let body = JSON.stringify(bodyObj);
        return this._http.post(url, body);
    }
}