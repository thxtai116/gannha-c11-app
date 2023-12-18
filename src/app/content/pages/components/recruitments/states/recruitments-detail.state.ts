import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

import { MenuItemModel, RecruitmentModel, UnitModel } from '../../../../../core/core.module';

@Injectable()

export class RecruitmentsDetailState {
    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>(null);

    recruitment$: BehaviorSubject<RecruitmentModel> = new BehaviorSubject<RecruitmentModel>(null);

    units$: BehaviorSubject<UnitModel[]> = new BehaviorSubject<UnitModel[]>([]);
}