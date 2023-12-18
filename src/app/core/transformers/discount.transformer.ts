import { DiscountViewModel } from '../view-models';
import { DiscountModel } from '../models';

export class DiscountTransformer {

    constructor() { }

    toDiscountViewModel(discount: DiscountModel): DiscountViewModel {
        let vm: DiscountViewModel = new DiscountViewModel();

        vm.Id = discount.Id;
        vm.Name = discount.Name;

        vm.DiscountType = discount.DiscountType;
        vm.DiscountAmount = discount.DiscountAmount;
        vm.UsePercentage = discount.UsePercentage;
        vm.DiscountPercentage = discount.DiscountPercentage / 100;

        vm.CreatedAt = new Date(discount.CreatedAt);
        vm.StartDate = new Date(discount.StartDate);
        vm.EndDate = new Date(discount.EndDate);

        vm.Status = discount.Status;

        return vm;
    }
}