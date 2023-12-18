import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BrandModel } from '../../../../../core/core.module';

@Injectable()

export class SellingPointsState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);

    icons$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
}