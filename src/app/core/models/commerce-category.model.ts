import { BaseModel } from './base/base.model';

export class CommerceCategoryModel extends BaseModel {
    Name: string = "";

    Published: boolean = false;

    DisplayOrder: number = 0;
}