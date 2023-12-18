import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, DateTimeUtility } from "../../utilities/index";

import { ReportValue } from "../../models/index";

@Injectable()

export class ReportService {
    private _apiEndpoint = env.service.endpoint;

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility) {
    }

    async getUnitBoard(id: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/UnitReports/Board";

        let bodyObj = {
            "UnitId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getUnitReport(id: string, reportType: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/UnitReports/Report";

        let bodyObj = {
            "UnitId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
            "ReportType": reportType,
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getJobBoard(id: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/JobReports/Board";

        let bodyObj = {
            "JobId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getJobReport(id: string, reportType: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/JobReports/Report";

        let bodyObj = {
            "JobId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
            "ReportType": reportType,
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getRecruitmentBoard(id: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/RecruitmentCampaignReports/Board";

        let bodyObj = {
            "CampaignId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getRecruitmentReport(id: string, reportType: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/RecruitmentCampaignReports/Report";

        let bodyObj = {
            "CampaignId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
            "ReportType": reportType,
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandUnitBoard(id: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/unit-board";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandUnitServiceBoard(id: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/unit-service-board";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandUnitReport(id: string, reportType: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/unit-report";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
            "ReportType": reportType,
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandSellingPointBoard(id: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/selling-point-board";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandSellingPointActionBoard(id: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/selling-point-action-board";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandSellingPointReport(id: string, reportType: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/selling-point-report";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
            "ReportType": reportType,
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandSellingPointActionReport(id: string, reportType: string, fromDate: Date, toDate: Date): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/selling-point-action-report";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
            "ReportType": reportType,
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandTopUnit(id: string, reportType: string, fromDate: Date, toDate: Date, top: number): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/top-unit";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
            "ReportType": reportType,
            "Top": top
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }

    async getBrandTopSellingPoint(id: string, reportType: string, fromDate: Date, toDate: Date, top: number): Promise<ReportValue[]> {
        let values: ReportValue[] = [];
        let url = this._apiEndpoint + "/BrandReports/top-selling-point";

        let bodyObj = {
            "BrandId": id,
            "FromDate": this._dateTimeUtil.convertDateToOnlyDateString(fromDate),
            "ToDate": this._dateTimeUtil.convertDateToOnlyDateString(toDate),
            "ReportType": reportType,
            "Top": top
        };

        let results: any[] = await this._http.post(url, bodyObj);

        if (results) {
            for (let value of results) {
                values.push(Object.assign(new ReportValue(), value));
            }
        }
        return values;
    }
}