import { TimingModel, AddressContactModel } from '../models';

export class PlaceForm {
    Id: string = "";

    Name: string = "";

    Timing: TimingModel = new TimingModel;

    Latitude: number = 0;

    Longitude: number = 0;

    Contact: AddressContactModel = new AddressContactModel();
}