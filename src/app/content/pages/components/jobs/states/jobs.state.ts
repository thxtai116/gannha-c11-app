import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BrandModel } from '../../../../../core/core.module';

@Injectable()

export class JobsState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);

    jobTypes$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(null);

    jobBenefits$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(null);

    jobTitles$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);
}