import { BehaviorSubject } from 'rxjs';
import { DiscountModel, BaseModel, MenuItemModel } from '../../../../../core/models';

export class DiscountsDetailState {
    discount$: BehaviorSubject<DiscountModel> = new BehaviorSubject<DiscountModel>(null);

    entities$: BehaviorSubject<BaseModel[]> = new BehaviorSubject<BaseModel[]>([]);

    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>([]);
}