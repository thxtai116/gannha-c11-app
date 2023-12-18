import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { TrendModel, MenuItemModel } from '../../../../../core/models';

@Injectable()

export class TrendsDetailState {
    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>(null);

    trend$: BehaviorSubject<TrendModel> = new BehaviorSubject<TrendModel>(null);
}