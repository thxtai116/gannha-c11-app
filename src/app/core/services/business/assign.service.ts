import { Injectable } from '@angular/core';

import { environment as env } from '../../../../environments/environment';

import { HttpUtility } from "../../utilities/index";

@Injectable()

export class AssignService {
    private _apiEndpoint = env.service.endpoint + '/assignment';

    constructor(private _httpUtil: HttpUtility) {
    }

    unassignUserFromBrand(userId: string, roleName: string, brandIds: string[]): Promise<boolean> {
        let url = `${this._apiEndpoint}/unassign`;
        let body = [];

        for (let id of brandIds) {
            body.push({
                ResourceId: id,
                ResourceType: "Brand",
                UserId: userId,
                Role: roleName,
            });
        }

        return this._httpUtil.post(url, body);
    }

    assignUserToBrand(userId: string, roleName: string, brandIds: string[]): Promise<boolean> {
        let url = `${this._apiEndpoint}/assign`;
        let body = {
            "UserId": userId,
            "Role": roleName,
            "ResourceType": "Brand",
            "Resources": brandIds
        };

        return this._httpUtil.post(url, body);
    }

    unassignUserFromUnit(userId: string, roleName: string, unitIds: string[]): Promise<boolean> {
        let url = `${this._apiEndpoint}/unassign`;
        let body = [];

        for (let id of unitIds) {
            body.push({
                ResourceId: id,
                ResourceType: "Unit",
                UserId: userId,
                Role: roleName,
            });
        }

        return this._httpUtil.post(url, body);
    }

    assignUserToUnit(userId: string, roleName: string, unitIds: string[]): Promise<boolean> {
        let url = `${this._apiEndpoint}/assign`;
        let bodyObj = {
            "UserId": userId,
            "Role": roleName,
            "ResourceType": "Unit",
            "Resources": unitIds
        };

        let body = JSON.stringify(bodyObj);

        return this._httpUtil.post(url, body);
    }
}