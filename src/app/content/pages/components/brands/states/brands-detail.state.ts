import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import {
    BrandModel,
    MenuItemModel,
} from "../../../../../core/core.module";

@Injectable()

export class BrandsDetailState {
    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>([]);

    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(new BrandModel());
}