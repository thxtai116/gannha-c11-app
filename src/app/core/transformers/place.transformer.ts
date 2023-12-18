import { PlaceModel } from "../models";
import { PlaceOverviewViewModel } from "../view-models";
import { LanguagePipe } from '../pipes';

export class PlaceTransformer {
    toPlaceOverview(place: PlaceModel): PlaceOverviewViewModel {
        let vm = new PlaceOverviewViewModel();

        vm.Id = place.Id;
        vm.Name = new LanguagePipe().transform(place.Name);
        vm.Address = place.Contact && place.Contact.Address ? new LanguagePipe().transform(place.Contact.Address) : "";

        return vm;
    }
}