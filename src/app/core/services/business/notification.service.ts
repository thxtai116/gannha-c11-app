import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, DateTimeUtility } from '../../utilities';

import { NotificationCampaignModel, QueryResultsModel } from '../../models';

import { NotificationRequestForm } from '../../forms';

@Injectable()

export class NotificationService {
    private _apiEndpoint = env.service.endpoint + "/push";

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility
    ) { }

    async getScheduledNotifications(): Promise<NotificationCampaignModel[]> {
        let url = `${this._apiEndpoint}/campaigns/schedules`;
        let results: any[] = await this._http.get(url);
        let campaigns: NotificationCampaignModel[] = [];

        if (results) {
            for (let campaign of results) {
                campaigns.push(Object.assign(new NotificationCampaignModel(), campaign));
            }
        }

        return campaigns;
    }

    cancelNotification(id: string | number) {
        let url = `${this._apiEndpoint}/campaigns/schedules/${id}`;

        return this._http.delete(url);
    }

    async getAll(pageIndex: number = 0, pageSize: number = 10): Promise<QueryResultsModel> {
        let url = `${this._apiEndpoint}/campaigns?pageIndex=${pageIndex}&pageSize=${pageSize}`;
        let result: any = await this._http.get(url);
        let data = new QueryResultsModel();

        if (result) {
            for (let campaign of result.Items) {
                data.items.push(Object.assign(new NotificationCampaignModel(), campaign));
            }
            data.totalCount = result.TotalItems;
        }

        return data;
    }

    async get(id: string): Promise<NotificationCampaignModel> {
        let url = `${this._apiEndpoint}/campaigns/${id}`;
        let campaign: NotificationCampaignModel = new NotificationCampaignModel();
        let result = await this._http.get(url);

        if (result) {
            Object.assign(campaign, result);
        }

        return campaign;
    }

    pushSellingPoint(model: NotificationRequestForm): Promise<any> {
        let url = `${this._apiEndpoint}/promotion/sellingpoint`;

        let bodyObj: any = {
            Request: {
                Title: {
                    "vi": model.Title
                },
                Content: {
                    "vi": model.Content
                },
                Segment: model.Segment,
                Devices: model.Devices,
                SpId: model.ResourceId
            }
        };

        if (!model.SendNow) {
            bodyObj.Schedule = {
                ExecutedTimes: model.ExecutedTimes,
                StartDate: this._dateTimeUtil.convertDateWithUTC(model.StartDate)
            }
        }

        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }

    pushCategory(model: NotificationRequestForm): Promise<any> {
        let url = `${this._apiEndpoint}/promotion/category`;

        let bodyObj: any = {
            Request: {
                Title: {
                    "vi": model.Title
                },
                Content: {
                    "vi": model.Content
                },
                Segment: model.Segment,
                Devices: model.Devices,
                CategoryId: model.ResourceId
            }
        };

        if (!model.SendNow) {
            bodyObj.Schedule = {
                ExecutedTimes: model.ExecutedTimes,
                StartDate: this._dateTimeUtil.convertDateWithUTC(model.StartDate)
            }
        }

        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }

    pushBrand(model: NotificationRequestForm): Promise<any> {
        let url = `${this._apiEndpoint}/promotion/brand`;

        let bodyObj: any = {
            Request: {
                Title: {
                    "vi": model.Title
                },
                Content: {
                    "vi": model.Content
                },
                Segment: model.Segment,
                Devices: model.Devices,
                BrandId: model.ResourceId
            }
        };

        if (!model.SendNow) {
            bodyObj.Schedule = {
                ExecutedTimes: model.ExecutedTimes,
                StartDate: this._dateTimeUtil.convertDateWithUTC(model.StartDate)
            }
        }

        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }

    pushCollection(model: NotificationRequestForm): Promise<any> {
        let url = `${this._apiEndpoint}/promotion/collection`;

        let bodyObj: any = {
            Request: {
                Title: {
                    "vi": model.Title
                },
                Content: {
                    "vi": model.Content
                },
                Segment: model.Segment,
                Devices: model.Devices,
                CollectionId: model.ResourceId
            }
        };

        if (!model.SendNow) {
            bodyObj.Schedule = {
                ExecutedTimes: model.ExecutedTimes,
                StartDate: this._dateTimeUtil.convertDateWithUTC(model.StartDate)
            }
        }

        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }

    registerOneSignal(userId: string) {
        if (!userId)
            return;

        let url = `${env.service.endpoint}/central/notifications/devices`;
        let bodyObj: any = {
            Handle: userId,
            Platform: "Browser",
            AppVersion: env.version,
            ApiVersion: "v1",
            Locale: "vi-VN"
        };

        let body = JSON.stringify(bodyObj);

        return this._http.post(url, body);
    }
}
