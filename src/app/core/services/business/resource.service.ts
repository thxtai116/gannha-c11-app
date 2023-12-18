import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility } from "../../utilities/index";
import { ResourceModel, GalleryExplorerModel } from '../../models';

@Injectable()
export class ResourceService {
	private _apiEndPoint = env.service.endpoint_vnext + "/gallery/v1/resources";

	constructor(private _httpUtil: HttpUtility) {
	}

	getVideoLink(id: string | number): Promise<any> {
		let url = `${this._apiEndPoint}/${id}/links`;

		return this._httpUtil.get(url);
	}

	async uploadPhotoToFolder(photo: string, folderId: number, name: string, caption: string): Promise<GalleryExplorerModel> {
		let url = `${this._apiEndPoint}?fId=${folderId}`;

		let body = JSON.stringify({
			Data: photo,
			Filename: name,
			Caption: caption,
		});

		let result = await this._httpUtil.post(url, body);

		return result;
	}

	async uploadFileToFolder(doc: File, folderId: number, caption: string = ""): Promise<GalleryExplorerModel> {
		let url = `${this._apiEndPoint}?fId=${folderId}`;

		let formData = new FormData();

		formData.append('File', doc);

		formData.append('Caption', caption);

		let result = await this._httpUtil.postForm(url, formData, null, true);

		return result;
	}

	async uploadToRoot(photo: string): Promise<ResourceModel> {
		let url = `${this._apiEndPoint}/submit`;

		let body = JSON.stringify({
			Data: photo
		});

		let result = await this._httpUtil.post(url, body);

		if (result && result.length > 0) {
			return result[0] as ResourceModel;
		}

		return new ResourceModel();
	}

	delete(id: number): Promise<any> {
		let url = `${this._apiEndPoint}/${id}`;

		return this._httpUtil.delete(url);
	}

	update(id: string, model: any): Promise<any> {
		let url = `${this._apiEndPoint}/${id}`;
		let bodyObj: any = {}
		let objs = Object.keys(model);

		for (let key of objs) {
			if (model[key]) {
				bodyObj[key] = model[key];
			}
		}

		let body = JSON.stringify(bodyObj);

		return this._httpUtil.put(url, body);
	}
}