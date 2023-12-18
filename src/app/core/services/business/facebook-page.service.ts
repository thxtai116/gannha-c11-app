import { Injectable } from "@angular/core";

import { startOfDay, endOfDay } from 'date-fns';

import { environment as env } from "../../../../environments/environment";

import { HttpUtility, DateTimeUtility } from '../../utilities';
import { FacebookPageModel, FacebookPostModel } from '../../models';
import { Status } from '../../enums';

@Injectable()

export class FacebookPageService {
    private _apiEndpoint = env.service.endpoint + '/pages';

    constructor(
        private _http: HttpUtility,
        private _dateTimeUtil: DateTimeUtility
    ) {
    }

    async getList(): Promise<FacebookPageModel[]> {
        let pages: FacebookPageModel[] = [];
        let results = await this._http.get(this._apiEndpoint);

        if (results) {
            for (let page of results) {
                pages.push(Object.assign(new FacebookPageModel(), page));
            }
        }

        return pages;
    }

    async getPosts(pageId: string, startDate: Date, endDate: Date): Promise<FacebookPostModel[]> {
        let url = `${this._apiEndpoint}/${pageId}/posts`;
        let posts: FacebookPostModel[] = [];
        let bodyObj = {
            "StartDate": this._dateTimeUtil.convertDateWithUTC(startOfDay(startDate)),
            "EndDate": this._dateTimeUtil.convertDateWithUTC(endOfDay(endDate))
        };

        let result = await this._http.post(url, JSON.stringify(bodyObj));

        if (result) {
            for (let post of result) {
                posts.push(Object.assign(new FacebookPostModel(), post));
            }
        }

        return posts;
    }

    async getPost(pageId: string, postId: string): Promise<FacebookPostModel> {
        let url = `${this._apiEndpoint}/${pageId}/posts/${postId}`;
        let result = await this._http.get(url);
        let post: FacebookPostModel = new FacebookPostModel();

        if (result) {
            post = Object.assign(new FacebookPostModel(), result);
        }

        return post;
    }

    updatePostStatus(pageId: string, postId: string, status: Status, refId: string = null) {
        let url = `${this._apiEndpoint}/${pageId}/posts/${postId}`;

        let body = JSON.stringify({
            "Status": status,
            "ReferenceId": refId
        });

        return this._http.put(url, body);
    }
}