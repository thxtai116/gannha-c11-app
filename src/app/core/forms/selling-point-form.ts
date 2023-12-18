import { GnServiceConnectionModel, ScheduleRepeatEveryModel, ResourceModel } from '../models';

export class SellingPointForm {
    DateRanges: Date[] = [new Date(), new Date()];

    TimeRanges: any[] = [];

    Posters: ResourceModel[] = [];

    Video: string[] = [];

    IsRepeat: boolean = false;

    Repeat: ScheduleRepeatEveryModel = new ScheduleRepeatEveryModel();

    Icon: string = "";

    Units: string[] = [];

    Order: number = 0;

    Tags: any[] = [];

    Title: string = "";

    TitleEn: string = "";

    Description: string = "";

    DescriptionEn: string = "";

    ApplyForSomeUnit: boolean = false;

    Actions: GnServiceConnectionModel[] = [];
}