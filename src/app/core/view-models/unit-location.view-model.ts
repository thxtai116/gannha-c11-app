import { AddressContactModel } from '../models';

export class UnitLocationViewModel {
    Id: string = "";

    BrandId: string = "";

    Lat: number = 0;

    Long: number = 0;

    Address: AddressContactModel = new AddressContactModel();
}