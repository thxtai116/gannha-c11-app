import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BrandModel, RecruiterModel } from '../../../../../core/core.module';

@Injectable()

export class RecruitersState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);

    selectedRecruiter: BehaviorSubject<RecruiterModel> = new BehaviorSubject<RecruiterModel>(null);
}