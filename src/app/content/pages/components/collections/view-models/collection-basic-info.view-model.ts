import { GenericResourceModel } from '../../../../../core/models';

export class CollectionBasicInfoViewModel {
    Title: string = "";

    TitleEn: string = "";

    Description: string = "";

    DescriptionEn: string = "";

    StartDate: Date = new Date();

    EndDate: Date = new Date();

    TimeRanges: any[] = [];

    Repeat: string = "";

    Status: number = 0;

    CreatedAt: Date = new Date();

    Resources: GenericResourceModel[]=[];
}