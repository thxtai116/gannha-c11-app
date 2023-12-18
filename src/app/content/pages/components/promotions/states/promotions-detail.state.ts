import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import {
    MenuItemModel,
    PromotionCodeCampaignModel,
} from "../../../../../core/core.module";

@Injectable()

export class PromotionsDetailState {
    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>([]);
    promotion$: BehaviorSubject<PromotionCodeCampaignModel> = new BehaviorSubject<PromotionCodeCampaignModel>(null);
}