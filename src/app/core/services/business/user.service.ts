import { Injectable } from '@angular/core';

import { HttpUtility, DateTimeUtility } from "../../utilities/index";

import { environment as env } from '../../../../environments/environment';
import { UserInfoModel, MenuItemModel, ProfileModel, UserConfigModel } from "../../models/index";
import { Moment } from 'moment';

@Injectable()
export class UserService {
    private passportEndpoint = env.service.passport + "/account";

    constructor(
        private _httpUtil: HttpUtility,
        private _dateTimeUtil: DateTimeUtility
    ) {
    }

    async getProfile(): Promise<ProfileModel> {
        let url = this.passportEndpoint + "/profile";
        let profile = new ProfileModel();
        let result = await this._httpUtil.get(url);

        if (result) {
            Object.assign(profile, result);
        }

        return profile;
    }

    async getMenu(): Promise<UserConfigModel> {
        let url = this.passportEndpoint + "/configuration";
        let config = new UserConfigModel();
        let result = await this._httpUtil.get(url);

        if (result) {
            Object.assign(config, result);
        }

        return config;
    }

    async updateProfile(profile: ProfileModel) {
        let url = this.passportEndpoint + "/profile";
        let bodyObj = {
            'DateOfBirth': this._dateTimeUtil.convertDateWithoutUTC(profile.DateOfBirth),
            //'DateOfBirth': profile.DateOfBirth,
            'FullName': profile.FullName.trim(),
            'Picture': profile.Picture,
            'Gender': profile.Gender,
        };

        let body = JSON.stringify(bodyObj);
        let result = await this._httpUtil.patch(url, body);
        return result;
    }

    async UploadProfileImage(image: string): Promise<ProfileModel> {
        let url = this.passportEndpoint + "/profile/image";
        let profile = new ProfileModel();
        let bodyObj = {
            'Data': image,
        };
        let body = JSON.stringify(bodyObj);
        let result = await this._httpUtil.post(url, body);
        if (result) {
            Object.assign(profile, result);
        }
        return profile;
    }

    changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
        let url = this.passportEndpoint + "/profile/password";
        let body = JSON.stringify({
            OldPassword: oldPassword,
            NewPassword: newPassword,
            ConfirmPassword: confirmPassword
        });

        return this._httpUtil.post(url, body);
    }

    // public inviteUser(user: UserInfoModel) {
    //     var url = this.apiEndpoint + "/invite";
    //     let body = JSON.stringify({
    //         FirstName: user.FirstName,
    //         LastName: user.LastName,
    //         Email: user.Email,
    //         PhoneNumber: user.PhoneNumber,
    //         ContractNumber: user.Contract,
    //         RoleId: user.Roles
    //     });

    //     return this._httpUtil.post(url, body);
    // }
}