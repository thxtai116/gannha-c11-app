import { UnitModel } from "../models";
import { UnitOverviewViewModel } from "../view-models";
import { LanguagePipe } from '../pipes';

export class UnitTransformer {

    toUnitOverView(unit: UnitModel): UnitOverviewViewModel {
        let vm = new UnitOverviewViewModel();

        vm.Id = unit.Id;
        vm.BrandId = unit.BrandId;
        vm.Name = new LanguagePipe().transform(unit.Name);
        vm.Address = unit.Contact ? new LanguagePipe().transform(unit.Contact.Address) : "";
        vm.Status = unit.Status;

        if (unit.Contact.Administration && typeof Object.keys(unit.Contact.Administration)[0] !== 'undefined') {
            vm.Country = unit.Contact.Administration[2] || "";
            vm.Province = unit.Contact.Administration[4] || "";
            vm.District = unit.Contact.Administration[6] || "";
            vm.Ward = unit.Contact.Administration[8] || "";
        }
        vm.Latitude = unit.Latitude;
        vm.Longitude = unit.Longitude;

        if (unit.Brand && unit.Brand.Id.length > 0) {
            vm.BrandId = unit.Brand.Id;
            vm.BrandName = new LanguagePipe().transform(unit.Brand.Name);
        }

        return vm;
    }
}