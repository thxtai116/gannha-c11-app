import { BehaviorSubject } from 'rxjs';
import { BrandModel } from '../../../../../core/models';

export class CommerceCategoriesState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);
}