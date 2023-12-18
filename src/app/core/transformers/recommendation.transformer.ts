import { RecommendationModel } from "../models/index";

import { RecommendationOverviewViewModel } from "../view-models/index";
import { LanguagePipe } from '../pipes';

export class RecommendationTransformer {
    toRecommendationOverview(model: RecommendationModel): RecommendationOverviewViewModel {
        let vm = new RecommendationOverviewViewModel();

        vm.Id = model.Id;
        vm.Name = new LanguagePipe().transform(model.Name);
        vm.Title = new LanguagePipe().transform(model.Title);
        vm.StartDate = new Date(model.StartDate);
        vm.EndDate = new Date(model.EndDate);
        vm.Status = model.Status;

        return vm;
    }
}