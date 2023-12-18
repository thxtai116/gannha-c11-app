
import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { BrandModel, MenuItemModel, CategoryModel, UtilityModel } from '../../../../../core/core.module';

@Injectable()

export class BrandReportState {
    loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}