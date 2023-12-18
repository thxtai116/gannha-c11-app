import { ResourceModel, GnServiceConnectionModel } from '../models';

export class BrandDefaultSellingPointViewModel {
    Id: string = "";

    Title: string = "";

    TitleEn: string = "";

    Description: string = "";

    DescriptionEn: string = "";

    Posters: ResourceModel[] = [];

    Actions: GnServiceConnectionModel[] = [];
}