import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

import { CollectionModel, MenuItemModel } from '../../../../../core/core.module';

@Injectable()

export class CollectionsDetailState {
    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>(null);

    collection$: BehaviorSubject<CollectionModel> = new BehaviorSubject<CollectionModel>(null);
}