import { BaseModel } from '../models';

export class CategoryTreeViewModel extends BaseModel {
    Id: string = "";

    ViName: string = "";
    
    EnName: string = "";

    Description = "";

    Icon: string[]  = [];

    Childs: CategoryTreeViewModel[] = [];
}