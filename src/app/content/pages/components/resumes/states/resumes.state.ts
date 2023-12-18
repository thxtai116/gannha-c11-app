import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BrandModel, RecruitmentModel } from '../../../../../core/core.module';

@Injectable()

export class ResumesState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);
}