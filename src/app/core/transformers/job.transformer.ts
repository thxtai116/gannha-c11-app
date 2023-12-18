import { JobViewModel } from '../view-models';
import { JobModel } from '../models';

export class JobTransformer {
    toJobViewModel(job: JobModel): JobViewModel {
        let vm = new JobViewModel();

        vm.Id = job.Id;
        vm.Title = job.Title;
        vm.Recruitment = job.Campaign.Title;
        vm.StartDate = new Date(job.StartDate);
        vm.EndDate = new Date(job.EndDate);
        vm.CreatedAt = new Date(job.CreatedAt);

        return vm;
    }
}