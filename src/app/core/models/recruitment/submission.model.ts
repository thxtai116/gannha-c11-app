import { BaseModel } from '../base/base.model';
import { LocaleString } from '../../types';
import { Interview } from './interview.model';

export class SubmissionModel extends BaseModel {
    FullName: string = "";

    BirthDay: Date = new Date();

    Email: string = "";

    Gender: any = 0;

    Phone: string = "";

    IdentityCardFront: string = "";

    IdentityCardBack: string = "";

    UnitId: string = "";

    WorkingAddress: string = "";

    Education: number = 0;

    GraduateYear: string = "";

    Major: string = "";

    SchoolName: string = "";

    Experiences: string = "";

    UnitName: LocaleString = {
        vi: ""
    };

    Interview: Interview = new Interview();

    JobId: string = "";

    JobRejectReasons: string[] = [];

    Status: any = {
        Color: "",
        Name: {
            vi: ""
        },
        Reason: []
    };

    NextStatus: any[] = [];
}