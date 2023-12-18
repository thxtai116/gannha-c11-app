import { UtilityModel } from "../models";
import { UtilityViewModel } from "../view-models";
import { LanguagePipe } from '../pipes';

export class UtilityTransformer {
    toUtilViewModel(unit: UtilityModel): UtilityViewModel {
        let vm = new UtilityViewModel();

        vm.Id = unit.Id;
        vm.Name = new LanguagePipe().transform(unit.Name);
        vm.Description = new LanguagePipe().transform(unit.Description);
        vm.Icon = unit.Icon

        return vm;
    }
}