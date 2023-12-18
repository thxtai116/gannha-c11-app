import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

import { UserInfoModel, ProfileModel } from '../../../../../core/core.module';

@Injectable()

export class AccountState {
    profile$: BehaviorSubject<ProfileModel> = new BehaviorSubject<ProfileModel>(null);
}