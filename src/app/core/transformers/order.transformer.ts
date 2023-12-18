import { OrderViewModel } from '../view-models';
import { OrderModel } from '../models';
import { DateTimeUtility } from '../utilities';

export class OrderTransformer {

    constructor(
        private _dateTimeUtil: DateTimeUtility
    ) { }

    toOrderOverview(order: OrderModel): OrderViewModel {
        let vm: OrderViewModel = new OrderViewModel();

        vm.Id = order.Id;
        vm.OrderStatus = order.OrderStatus;
        vm.OrderTotal = order.OrderTotal;
        vm.CreatedAt = this._dateTimeUtil.convertStringToTime(order.CreatedAt.toString());
        vm.Customer = order.Customer.FullName;
        vm.UnitName = order.UnitName["vi"];

        return vm;
    }
}