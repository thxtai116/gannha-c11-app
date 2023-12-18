import { Injectable } from "@angular/core";

import {
    CategoryModel,
    UtilityModel
} from "../../../../../core/core.module";

import { BehaviorSubject } from "rxjs";

@Injectable()

export class BrandsState {
    ready$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    categogies$: BehaviorSubject<CategoryModel[]> = new BehaviorSubject<CategoryModel[]>(null);

    subCategories$: BehaviorSubject<CategoryModel[]> = new BehaviorSubject<CategoryModel[]>(null);

    utilities$: BehaviorSubject<UtilityModel[]> = new BehaviorSubject<UtilityModel[]>(null);
}