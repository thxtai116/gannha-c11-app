import { RawUnitModel } from '../models';
import { RawUnitOverviewViewModel } from '../view-models';

export class RawUnitTransformer {
    toRawUnitViewModel(unit: RawUnitModel): RawUnitOverviewViewModel {
        let vm = new RawUnitOverviewViewModel();

        vm.Id = unit.Id;
        vm.Name = unit.Name;
        vm.Address = unit.Address;
        vm.ActionStatus = unit.ActionStatus;
        vm.CreatedAt = new Date(unit.CreatedAt);
        vm.UpdatedAt = new Date(unit.UpdatedAt);
        vm.ActionCode = unit.ActionCode;

        return vm;
    }
}