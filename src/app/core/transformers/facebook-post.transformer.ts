import { FacebookPostModel } from '../models';
import { FacebookPostOverviewViewModel } from '../view-models';

export class FacebookPostTransformer {
    toFacebookPostOverview(model: FacebookPostModel): FacebookPostOverviewViewModel {
        let vm = new FacebookPostOverviewViewModel();

        vm.Id = model.Id;
        vm.CreatedAt = new Date(model.CreatedDate);
        vm.Status = model.Status;

        return vm;
    }
}