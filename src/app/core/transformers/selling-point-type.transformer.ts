import { SellingPointTypeModel } from "../models";
import { SellingPointTypeViewModel } from "../view-models";
import { LanguagePipe } from '../pipes';

export class SellingPointTypeTransformer {
    toSellingPointTypeview(sp: SellingPointTypeModel): SellingPointTypeViewModel {
        let vm = new SellingPointTypeViewModel();

        vm.Id = sp.Id;
        vm.Name = new LanguagePipe().transform(sp.Name);
        vm.Description = new LanguagePipe().transform(sp.Description);
        vm.Icon = sp.Icon;
        vm.Color = sp.Color;

        return vm;
    }
}