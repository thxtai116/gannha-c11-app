import { BaseModel } from './base/base.model';

export class FacebookPostModel extends BaseModel {
    Message: string = "";

    Picture: string = "";

    Link: string = "";

    PageId: string = "";

    CreatedDate: Date = new Date();

    UpdatedDate: Date = new Date();

    ReferenceId: string = "";
}