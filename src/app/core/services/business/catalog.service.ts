import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, StorageUtility } from "../../utilities/index";

import { LocalStorageKey } from '../../consts';

import { SellingPointIconModel } from '../../models/selling-point-icon.model';

@Injectable()

export class CatalogService {
    private _apiEndpoint = `${env.service.endpoint}/catalog`;

    constructor(
        private _storageUtil: StorageUtility,
        private _httpUtil: HttpUtility) {
    }

    async getSellingPointIcons(): Promise<SellingPointIconModel[]> {
        let icons: SellingPointIconModel[] = [];
        let rawIcons: any[] = JSON.parse(this._storageUtil.get(LocalStorageKey.sellingPointIcons));
        let url: string = `${this._apiEndpoint}/sptype`;

        if (!rawIcons) {
            rawIcons = await this._httpUtil.get(url);
            if (rawIcons) {
                for (let icon of rawIcons) {
                    if (icon.Icon.length > 0) {
                        icons.push(icon);
                    }
                }
                this._storageUtil.set(LocalStorageKey.sellingPointIcons, JSON.stringify(icons));
            }
        } else {
            icons = rawIcons;
        }

        return icons;
    }
}