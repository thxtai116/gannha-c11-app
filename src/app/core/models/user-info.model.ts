import { BaseModel } from "./base/base.model";

export class UserInfoModel extends BaseModel {
    Id: string = '';

    FirstName: string = '';

    LastName: string = '';

    Email: string = '';

    Roles: string = '';

    RoleNames: string[] = [];

    Locked: boolean = false;

    JoinDate: Date = new Date();

    Active: boolean = false;

    DisplayName: string = '';

    TenantId: string = '';

    Contract: string = '';

    PhoneNumber: string = '';

    ProfileImage: string = '';

    EmailConfirmed: boolean = false;

    PhoneNumberConfirmed: boolean = false;

    Resources: any = {};
}