import { UserInfoModel } from "../models";

import { UserInfoOverviewViewModel } from "../view-models";

import { Status } from "../enums";

export class UserTransformer {
    toUserInfoOverviewViewModel(entity: UserInfoModel): UserInfoOverviewViewModel {
        let vm = new UserInfoOverviewViewModel();

        vm.Id = entity.Id;
        vm.Email = entity.Email;
        vm.Name = entity.DisplayName;
        vm.Role = entity.RoleNames.length > 0 ? entity.RoleNames[0] : "";
        vm.Status = entity.Locked ? Status.Deactive : Status.Active;

        return vm;
    }
}