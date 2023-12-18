import { RecruitmentViewModel } from '../view-models';
import { RecruitmentModel } from '../models';

export class RecruitmentTransformer {
    toRecruitmentViewModel(rec: RecruitmentModel): RecruitmentViewModel {
        let vm = new RecruitmentViewModel();

        vm.Id = rec.Id;
        vm.Title = rec.Title;
        vm.CreatedAt = new Date(rec.CreatedAt);

        return vm;
    }
}