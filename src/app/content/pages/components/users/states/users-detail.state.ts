
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { MenuItemModel, UserInfoModel } from "../../../../../core/core.module";

@Injectable()

export class UsersDetailState {
    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>(null);

    user$: BehaviorSubject<UserInfoModel> = new BehaviorSubject<UserInfoModel>(null);
}
