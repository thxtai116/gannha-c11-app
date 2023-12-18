import { PhoneModel } from "../models/index";
import { PhoneViewModel } from "../view-models";
import { LanguagePipe } from '../pipes';

export class PhoneTransformer {
    toPhoneOverview(model: PhoneModel): PhoneViewModel {
        let vm = new PhoneViewModel();
        vm.Value = model.Value;
        vm.Description = new LanguagePipe().transform(model.Description);
        vm.Type = model.Type;
        return vm;
    }

    toPhoneModel(model: PhoneViewModel): PhoneModel {
        let vm = new PhoneModel();
        vm.Value = model.Value;
        vm.Description = {
            "vi": model.Description
        };
        vm.Type = model.Type;
        return vm;
    }
}