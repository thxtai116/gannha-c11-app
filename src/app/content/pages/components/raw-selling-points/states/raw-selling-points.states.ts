import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

import { FacebookPageModel } from '../../../../../core/core.module';

@Injectable()

export class RawSellingPointsState {
    pages$: BehaviorSubject<FacebookPageModel[]> = new BehaviorSubject<FacebookPageModel[]>(null);
}