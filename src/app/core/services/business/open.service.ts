import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility, StorageUtility } from "../../utilities/index";

import { GnServiceConnectionModel } from "../../models/index";
import { LocalStorageKey, OpenServiceType } from '../../consts';

@Injectable()

export class OpenService {
    private _apiEndpoint = env.service.endpoint + '/open';
    private _defaultServices: GnServiceConnectionModel[] = [];

    constructor(
        private _httpUtil: HttpUtility,
        private _storageUtil: StorageUtility
    ) {
    }

    async getByType(entityType: string, actionType: string, force: boolean = false): Promise<GnServiceConnectionModel[]> {
        let url = `${this._apiEndpoint}/services/${entityType}?actionType=${actionType}`;
        let services: GnServiceConnectionModel[] = [];
        let key = this.getLocalStorageKey(entityType);

        if(!key) return services;

        if (force) {
            let results: any[] = await this._httpUtil.get(url);

            if (results) {
                for (let config of results) {
                    services.push(Object.assign(new GnServiceConnectionModel(), config));
                }
            }
            this._storageUtil.set(key, JSON.stringify(services));
            return services;
        }

        let rawServices: any[] = JSON.parse(this._storageUtil.get(key));

        if (!rawServices) {
            rawServices = await this._httpUtil.get(url);
            if (rawServices) {
                for (let icon of rawServices) {
                    if (icon.Icon.length > 0) {
                        services.push(icon);
                    }
                }
                this._storageUtil.set(key, JSON.stringify(services));
            }
        } else {
            services = rawServices;
        }


        return services;
    }

    private getLocalStorageKey(entityType: string): string {
        switch (entityType) {
            case OpenServiceType.SellingPoint:
                return LocalStorageKey.sellingPointOpenServices
            case OpenServiceType.Brand:
                return LocalStorageKey.brandOpenSerices
            default:
                return null;
        }    
    }
}