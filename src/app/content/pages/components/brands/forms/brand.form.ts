import { ContactModel, ResourceModel, TimingModel, CategoryModel } from "../../../../../core/models";
import { BehaviorSubject } from "rxjs";

export class BrandForm {
    Id: string = "";

    Name: string = "";

    Description: string = "";

    NumberOfUnits: number = 0;

    Tags: any[] = [];

    Logo: ResourceModel[] = [];

    Background: ResourceModel[] = [];

    Video: string[] = [];

    Pics: ResourceModel[] = [];

    Timing: TimingModel = new TimingModel();

    Utilities: string[] = [];

    DefaultSellingPointTitle: string = "";

    DefaultSellingPointDescription: string = "";

    Poster: ResourceModel[] = [];

    Contact: ContactModel = new ContactModel();

    Categories: string[] = [];

    CompanyName: string = "";

    TaxCode: string = "";

    SelectedCategoryies$: BehaviorSubject<CategoryModel[]> = new BehaviorSubject<CategoryModel[]>([]);
}