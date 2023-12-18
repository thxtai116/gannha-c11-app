import { BaseModel } from '../base/base.model';

export class JobModel extends BaseModel {
    Title: string = "";

    Description: string = "";

    Requirements: string = "";

    JobTypes: string[] = [];

    JobBenefits: string[] = [];

    JobTitles: any[] = [];

    Salary: string = "";

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    Campaign: any = {
        "Id": "",
        "Title": ""
    };

    Demands: number = 0;

    BrandId: string = "";

    WorkingAddress: string = "";

    RequireSubmitFields: any = {};

    Units: string[] = [];
}