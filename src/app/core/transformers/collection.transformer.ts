import { CollectionModel } from "../models/index";

import { CollectionOverviewViewModel } from "../view-models/index";
import { LanguagePipe } from '../pipes';

export class CollectionTransformer {
    toCollectionOverview(model: CollectionModel): CollectionOverviewViewModel {
        let vm = new CollectionOverviewViewModel();

        vm.Id = model.Id;
        vm.Title = new LanguagePipe().transform(model.Title) || "[No Name]";
        vm.StartDate = new Date(model.StartDate);
        vm.EndDate = new Date(model.EndDate);
        vm.Status = model.Status;

        return vm;
    }
}