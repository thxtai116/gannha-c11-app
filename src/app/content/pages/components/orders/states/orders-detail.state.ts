import { BehaviorSubject } from 'rxjs';
import { OrderModel, MenuItemModel } from '../../../../../core/core.module';

export class OrdersDetailState {
    order$: BehaviorSubject<OrderModel> = new BehaviorSubject<OrderModel>(null);

    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>([]);
}