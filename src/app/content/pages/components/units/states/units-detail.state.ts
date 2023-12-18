
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { UnitModel } from '../../../../../core/core.module';

@Injectable()

export class UnitsDetailState {
    unit$: BehaviorSubject<UnitModel> = new BehaviorSubject<UnitModel>(null);
}