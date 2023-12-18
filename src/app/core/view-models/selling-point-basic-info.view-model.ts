import { GnServiceConnectionModel, ResourceModel } from '../models';

export class SellingPointBasicViewModel {
    Title: string = "";

    TitleEn: string = "";

    Description: string = "";

    DescriptionEn: string = "";

    Status: number = 0;

    Posters: ResourceModel[] = [];

    Video: string[] = [];

    Units: string[] = [];

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    IconName: string = "";

    Icon: string = "";

    Order: number = 0;

    TimeRanges: any[] = [];

    Actions: GnServiceConnectionModel[] = [];

    Tags: string[] = [];

    RepeatString: string = "";
}