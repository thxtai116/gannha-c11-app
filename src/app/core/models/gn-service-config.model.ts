import { BaseModel } from "./base/base.model";

import { GnServiceConnectionModel } from "./gn-service-connection.model";

export class GnServiceConfigModel extends BaseModel {
    TenantId: string = "";

    BrandId: string = "";

    Units: string[] = [];

    Connection: GnServiceConnectionModel = new GnServiceConnectionModel();

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    ReplaceWith: string = "";

    Position: number = 0;
}