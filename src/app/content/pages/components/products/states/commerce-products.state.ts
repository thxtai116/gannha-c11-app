import { BehaviorSubject } from 'rxjs';
import { BrandModel } from '../../../../../core/core.module';

export class CommerceProductsState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);
}