import { BehaviorSubject } from 'rxjs';
import { BrandModel, CommerceCategoryModel, CommerceProductModel } from '../../../../../core/models';

export class DiscountsState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);

    commerceCates$: BehaviorSubject<CommerceCategoryModel[]> = new BehaviorSubject<CommerceCategoryModel[]>(null);

    commerceProducts$: BehaviorSubject<CommerceProductModel[]> = new BehaviorSubject<CommerceProductModel[]>(null);
}