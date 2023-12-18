import { LocaleString } from '../../types/locale-string.type';

export class Interview {
    AppointmentId: string = "";

    ResumeId: string = "";

    IsOnline: boolean;

    Time: Date = new Date();

    Latitude: number = 0;

    Longitude: number = 0;

    Location: string = "";

    Note: string = "";

    Phone: string = "";

    UnitName: LocaleString = {
        "vi": ""
    };

    JobTitle: string = "";

    FullName: string = "";
}