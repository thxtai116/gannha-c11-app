
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { BrandModel, MenuItemModel, CategoryModel, UtilityModel } from '../../../../../core/core.module';

@Injectable()

export class BrandState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);

    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>([]);

    categogies$: BehaviorSubject<CategoryModel[]> = new BehaviorSubject<CategoryModel[]>(null);

    subCategories$: BehaviorSubject<CategoryModel[]> = new BehaviorSubject<CategoryModel[]>(null);

    utilities$: BehaviorSubject<UtilityModel[]> = new BehaviorSubject<UtilityModel[]>(null);
    
    // kingServices$: BehaviorSubject<GnServiceConnectionModel[]> = new BehaviorSubject<GnServiceConnectionModel[]>(null);

    // defaultServices$: BehaviorSubject<GnServiceConnectionModel[]> = new BehaviorSubject<GnServiceConnectionModel[]>(null);

    // spType$: BehaviorSubject<SellingPointTypeModel[]> = new BehaviorSubject<SellingPointTypeModel[]>([]);
}