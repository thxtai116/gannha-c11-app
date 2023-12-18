import { GnServiceConfigModel } from "../models/index";

import { GnServiceConfigOverviewViewModel } from "../view-models/index";
import { LanguagePipe } from '../pipes';

export class OpenServiceTransformer {
    toGnServiceConfigOverview(model: GnServiceConfigModel): GnServiceConfigOverviewViewModel {
        let vm = new GnServiceConfigOverviewViewModel();

        vm.Id = model.Id;
        vm.Name = new LanguagePipe().transform(model.Connection.Title);
        vm.Type = model.Connection.Type;
        vm.StartDate = new Date(model.StartDate);
        vm.EndDate = new Date(model.EndDate);
        vm.CreatedAt = new Date(model.CreatedAt);

        return vm;
    }
}