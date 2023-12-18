import { TenantModel } from "../models";

import { TenantOverviewViewModel } from "../view-models";

import { Status } from "../enums";

export class TenantTransformer {
    toTenantOverView(tenant: TenantModel): TenantOverviewViewModel {
        let vm = new TenantOverviewViewModel();

        vm.Id = tenant.Id;
        vm.Name = tenant.CompanyName;
        vm.OwnerName = tenant.OwnerName;
        vm.Status = tenant.Active ? Status.Active : Status.Deactive;

        return vm;
    }
}