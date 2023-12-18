import { Injectable } from '@angular/core';

import { environment as env } from '../../../../../environments/environment';

import { GalleryExplorerModel } from '../../../models';

import { HttpUtility } from '../../../utilities';

@Injectable()
export class ExplorerService {
    private apiEndpoint = env.service.endpoint_vnext + "/gallery/v1";
    private HTTP: string = "http://";
    private HTTPS: string = "https://";

    constructor(
        private _httpUtil: HttpUtility
    ) {
    }

    async getExplorerItem(folderId: number = 0, includehidden: boolean = false): Promise<GalleryExplorerModel[]> {
        let data: GalleryExplorerModel[] = [];

        let url = `${this.apiEndpoint}/explorer?fId=${folderId}&includehidden=${includehidden}`;

        let result: any[] = await this._httpUtil.get(url);

        if (result) {
            for (let item of result) {
                let model = Object.assign(new GalleryExplorerModel(), item) as GalleryExplorerModel;

                if (model.Path)
                    model.Url = model.Path.indexOf(this.HTTP) > -1 || model.Path.indexOf(this.HTTPS) > -1 ? model.Path : `${env.fileStorageEndpoint}${model.Path}`;

                if (model.Thumbnail)
                    model.Thumbnail = model.Thumbnail && (model.Thumbnail.indexOf(this.HTTP) > -1 || model.Thumbnail.indexOf(this.HTTPS) > -1) ? model.Thumbnail : `${env.fileStorageEndpoint}${model.Thumbnail}`;

                data.push(model);
            }
        }

        return data;
    }
}