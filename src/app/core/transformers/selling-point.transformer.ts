import { SellingPointModel } from "../models";
import { SellingPointOverviewViewModel } from "../view-models";
import { LanguagePipe } from '../pipes';
import { ResourceType } from '../enums';

export class SellingPointTransformer {
    toSellingPointOverview(sp: SellingPointModel): SellingPointOverviewViewModel {
        let vm = new SellingPointOverviewViewModel();

        vm.Id = sp.Id;
        vm.Title = new LanguagePipe().transform(sp.Detail.Title) || "[No Name]";
        vm.StartDate = new Date(sp.StartDate);
        vm.EndDate = new Date(sp.EndDate);
        vm.Status = sp.Status;
        vm.Actions = sp.Actions;
        vm.Pictures = sp.Gallery.filter(x => x.Type === ResourceType.Image) || [];
        vm.Repeat = sp.Repeat;
        return vm;
    }
}