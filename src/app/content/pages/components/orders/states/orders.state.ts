import { BehaviorSubject } from 'rxjs';
import { BrandModel, UnitModel } from '../../../../../core/models';

export class OrdersState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);

    units$: BehaviorSubject<UnitModel[]> = new BehaviorSubject<UnitModel[]>([]);
}