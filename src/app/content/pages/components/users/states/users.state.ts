
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { BrandModel, CategoryModel } from "../../../../../core/core.module";

@Injectable()

export class UsersState {
    acceptableRoles$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);

    subCategories$: BehaviorSubject<CategoryModel[]> = new BehaviorSubject<CategoryModel[]>(null);

    brands$: BehaviorSubject<BrandModel[]> = new BehaviorSubject<BrandModel[]>(null);
}
