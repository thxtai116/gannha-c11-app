import { SubmissionModel } from '../models';
import { SubmissionViewModel } from '../view-models';

export class SubmissionTransformer {
    toSubmissionViewModel(model: SubmissionModel): SubmissionViewModel {
        let vm = new SubmissionViewModel();

        vm.Id = model.Id;
        vm.FullName = model.FullName;
        vm.Phone = model.Phone;
        vm.Email = model.Email;
        vm.Gender = model.Gender;
        vm.CreatedAt = model.CreatedAt;
        vm.JobId = model.JobId;
        vm.UnitId = model.UnitId;
        vm.Status = model.Status;

        return vm;
    }
}