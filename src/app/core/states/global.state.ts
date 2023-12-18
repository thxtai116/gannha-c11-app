import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { ProfileModel, BrandModel } from '../models';

@Injectable()

export class GlobalState {
    brand$: BehaviorSubject<BrandModel> = new BehaviorSubject<BrandModel>(null);

    brands$: BehaviorSubject<BrandModel[]> = new BehaviorSubject<BrandModel[]>(null);

    userInfoSub$: BehaviorSubject<ProfileModel> = new BehaviorSubject<ProfileModel>(null);

    asideLeftSub$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    syncBrand: BehaviorSubject<string> = new BehaviorSubject<string>(null);
}