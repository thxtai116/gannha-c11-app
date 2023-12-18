import { TrendModel } from "../models/index";

import { TrendOverviewViewModel } from "../view-models/index";
import { LanguagePipe } from '../pipes';

export class TrendTransformer {
    toTrendOverview(model: TrendModel): TrendOverviewViewModel {
        let vm = new TrendOverviewViewModel();

        vm.Id = model.Id;
        vm.Name = new LanguagePipe().transform(model.Name);
        vm.StartDate = new Date(model.StartDate);
        vm.EndDate = new Date(model.EndDate);
        vm.Status = model.Status;

        return vm;
    }
}