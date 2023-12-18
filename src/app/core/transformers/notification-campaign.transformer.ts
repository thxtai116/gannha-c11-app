import { NotificationCampaignModel } from '../models';
import { NotificationCampaignOverviewViewModel } from '../view-models';
import { LanguagePipe } from '../pipes';

export class NotificationCampaignTransformer {
    toNotificationCampaignOverview(model: NotificationCampaignModel): NotificationCampaignOverviewViewModel {
        let vm = new NotificationCampaignOverviewViewModel();

        vm.Id = model.Id;
        vm.CreatedAt = new Date(model.CreatedAt);
        vm.NotificationType = model.NotificationType;
        vm.Seen = model.Seen;
        vm.Total = model.Total;
        vm.Title = new LanguagePipe().transform(model.Content.Title) || "[No Name]";
        vm.Status = model.Status;

        return vm;
    }
}