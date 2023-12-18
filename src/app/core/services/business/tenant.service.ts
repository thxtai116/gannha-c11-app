import { Injectable } from '@angular/core';
import { HttpUtility } from "../../utilities/index";

import { environment as env } from '../../../../environments/environment';

import {
    TenantModel,
    UserInfoModel
} from "../../models/index";

@Injectable()

export class TenantService {
    private _apiEndpoint = env.service.endpoint + "/organizations";
    private _tenants: TenantModel[] = [];

    constructor(private _httpUtil: HttpUtility) {
    }

    async getAll(reset: boolean = false): Promise<TenantModel[]> {
        let tenants: TenantModel[] = [];

        if (reset) {
            this._tenants = [];
        }

        if (this._tenants.length === 0) {
            var result = await this._httpUtil.get(this._apiEndpoint);

            if (result) {
                for (let tenant of result) {
                    tenants.push(Object.assign(new TenantModel(), tenant));
                }
            }

            this._tenants = tenants;
        }
        else {
            tenants = this._tenants;
        }

        return tenants;
    }

    async get(id: string): Promise<TenantModel> {
        let url = `${this._apiEndpoint}/${id}`;

        let result = await this._httpUtil.get(url);

        return Object.assign(new TenantModel(), result);
    }

    async getUsers(id: string = ""): Promise<UserInfoModel[]> {
        let url = id.length === 0 ? `${this._apiEndpoint}/current/users` : `${this._apiEndpoint}/${id}/users`;
        let results = await this._httpUtil.get(url);
        let users: UserInfoModel[] = [];

        if (results) {
            for (let user of results) {
                users.push(Object.assign(new UserInfoModel(), user));
            }
        }

        return users;
    }

    async getUserById(id: string, includeResources: boolean = true): Promise<UserInfoModel> {
        let url = `${this._apiEndpoint}/current/users/${id}`;

        if (includeResources)
            url = `${url}?includeResources=true`;

        let model = new UserInfoModel();
        let result = await this._httpUtil.get(url);

        if (result) {
            Object.assign(model, result);
        }

        return model;
    }

    getAcceptableRoles() {
        let url = `${this._apiEndpoint}/current/roles`;

        return this._httpUtil.get(url);
    }

    create(tenant: TenantModel, owner: UserInfoModel): Promise<TenantModel> {
        let bodyObj = {
            'Tenant': {
                'CompanyName': tenant.CompanyName,
                'CompanyAddress': tenant.CompanyAddress,
                'CompanyPhone': tenant.CompanyPhone,
                'TaxCode': tenant.TaxCode
            },
            'Owner': {
                'FirstName': owner.FirstName,
                'LastName': owner.LastName,
                'Email': owner.Email
            }
        };

        let body = JSON.stringify(bodyObj);

        return this._httpUtil.post(this._apiEndpoint, body);
    }

    deactivate(id: string) {
        let url = `${this._apiEndpoint}/${id}`;
        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._httpUtil.put(url, body);
    }

    activate(id: string) {
        let url = `${this._apiEndpoint}/${id}`;
        let body = JSON.stringify({
            "Status": "Active"
        });

        return this._httpUtil.put(url, body);
    }

    createUser(user: UserInfoModel) {
        var url = `${this._apiEndpoint}/current/users/create`;
        let body = JSON.stringify({
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email,
            PhoneNumber: user.PhoneNumber,
            ContractNumber: user.Contract,
            RoleId: user.Roles
        });

        return this._httpUtil.post(url, body);
    }

    changeUserRole(id: string, toRoleName: string) {
        var url = `${this._apiEndpoint}/current/users/role`;

        let body = JSON.stringify({
            UserId: id,
            Role: toRoleName
        });

        return this._httpUtil.post(url, body);
    }

    deactivateUser(id: string) {
        let url = `${this._apiEndpoint}/current/users/${id}`;

        let body = JSON.stringify({
            "Status": "Deactive"
        });

        return this._httpUtil.put(url, body);
    }

    activateUser(id: string) {
        let url = `${this._apiEndpoint}/current/users/${id}`;

        let body = JSON.stringify({
            "Status": "Active"
        });

        return this._httpUtil.put(url, body);
    }
}