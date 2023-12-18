
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SellingPointModel } from '../../../../../core/core.module';

@Injectable()

export class SellingPointsDetailState {
    sellingPoint$: BehaviorSubject<SellingPointModel> = new BehaviorSubject<SellingPointModel>(null);
}