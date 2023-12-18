import { Injectable } from "@angular/core";
import { Headers, RequestOptions } from "@angular/http";

import { environment as env } from "../../../../environments/environment";
import { HttpUtility } from "../../utilities";

import { Blob } from "../../models/index";

@Injectable()

export class IconService {
    private _apiEndPoint = env.service.endpoint + '/icons';

    constructor(
        private _http: HttpUtility
    ) {
    }

    async getBlobs(): Promise<Blob[]> {
        var blobs: Blob[] = [];
        let url = `${this._apiEndPoint}`;
        let results: any[] = await this._http.get(url);

        if (results) {
            for (let item of results) {
                blobs.push(Object.assign(new Blob(), item))
            }
        }

        return blobs;
    }

    async create(photo: string, fileName: string, directory: string) {
        let url = `${this._apiEndPoint}/submit`;

        let body = JSON.stringify({
            "Data": photo,
            "Filename": fileName,
            "Directory": directory
        });

        return this._http.post(url, body);
    }

    public delete(id: string) {
        var url = `${this._apiEndPoint}/${id}`;

        return this._http.delete(url);
    }

    async submit(formData: FormData) {
        let url = `${this._apiEndPoint}`;

        return this._http.postForm(url, formData, null, true);
    }
}