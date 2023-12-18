import { BaseModel } from '../models';

export class BrandViewModel extends BaseModel {
    Name: string = "";

    Categories: string[] = [];

    CategoryNames: string[] = [];
}