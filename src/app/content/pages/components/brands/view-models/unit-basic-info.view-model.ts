import { TimingModel, PhoneModel } from "../../../../../core/models";

export class UnitBasicInfoViewModel {
    Name: string = "";

    Address: string = "";

    Status: number = 0;

    Utilities: string[] = [];

    BusinessCenter: string = "";

    Timing: TimingModel = new TimingModel();

    Phones: PhoneModel[] = [];
}