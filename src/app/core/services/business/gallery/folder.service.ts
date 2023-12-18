import { Injectable } from '@angular/core';

import { environment as env } from "../../../../../environments/environment";

import { HttpUtility } from '../../../utilities';

import { GalleryExplorerModel } from '../../../models';

@Injectable()
export class FolderService {

    private apiEndpoint = env.service.endpoint_vnext + "/gallery/v1/folders";

    constructor(
        private _httpUtil: HttpUtility
    ) {
    }

    async getFolders(): Promise<GalleryExplorerModel[]> {
        let data: GalleryExplorerModel[] = [];

        let result: any[] = await this._httpUtil.get(this.apiEndpoint);

        if (result) {
            for (let folder of result) {
                data.push(Object.assign(new GalleryExplorerModel(), folder));
            }
        }

        return data;
    }

    async getFoldersAsTree(): Promise<GalleryExplorerModel[]> {
        let data: GalleryExplorerModel[] = [];

        let url = `${this.apiEndpoint}?view=tree`;

        let result: any[] = await this._httpUtil.get(url);

        if (result) {
            for (let folder of result) {
                data.push(Object.assign(new GalleryExplorerModel(), folder));
            }
        }

        return data;
    }

    async getFolderById(id: string, includeResource: boolean): Promise<GalleryExplorerModel> {
        let url = `${this.apiEndpoint}/${id}?includeResource=${includeResource}`;

        let result: any[] = await this._httpUtil.get(url);

        return Object.assign(new GalleryExplorerModel(), result);
    }

    async createFolder(name: string, parentId: string): Promise<any> {
        let bodyObj = {
            Name: name,
            ParentId: parentId
        }
        let body = JSON.stringify(bodyObj);
        
        return this._httpUtil.post(this.apiEndpoint, body);
    }

    async deleteFolder(id: string): Promise<any> {
        let url = `${this.apiEndpoint}/${id}`;

        return this._httpUtil.delete(url);
    }

    async updateFolder(id: number, name: string): Promise<any> {
        let url = `${this.apiEndpoint}/${id}`;
        let bodyObj = {
            Name: name
        }
        let body = JSON.stringify(bodyObj);

        return this._httpUtil.patch(url, body);
    }
}