import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

import { BrandModel } from '../../../../../core/core.module';

@Injectable()

export class RawUnitsState {
    brands$: BehaviorSubject<BrandModel[]> = new BehaviorSubject<BrandModel[]>(null);

    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);

    brandStatistics$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
}