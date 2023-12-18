import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

import { MenuItemModel, JobModel } from '../../../../../core/core.module';

@Injectable()

export class JobsDetailState {
    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>(null);

    job$: BehaviorSubject<JobModel> = new BehaviorSubject<JobModel>(null);
}