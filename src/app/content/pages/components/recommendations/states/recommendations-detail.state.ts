import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';
import { MenuItemModel, RecommendationModel } from '../../../../../core/core.module';

@Injectable()

export class RecommendationsDetailState {
    menu$: BehaviorSubject<MenuItemModel[]> = new BehaviorSubject<MenuItemModel[]>(null);

    recommendation$: BehaviorSubject<RecommendationModel> = new BehaviorSubject<RecommendationModel>(null);
}