import { BrandModel } from "../models";
import { BrandViewModel } from "../view-models";
import { LanguagePipe } from '../pipes';

export class BrandTransformer {
    toBrandOverView(brand: BrandModel): BrandViewModel {
        let vm = new BrandViewModel();

        vm.Id = brand.Id;
        vm.Name = new LanguagePipe().transform(brand.Name);
        vm.Status = brand.Status;
        vm.Categories = brand.Categories;

        return vm;
    }
}