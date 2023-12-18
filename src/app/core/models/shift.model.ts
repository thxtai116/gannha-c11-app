import { SpecificTimingModel } from "./specific-timing.model";

export class ShiftModel {
    Name: string = "";

    Active: boolean = false;

    Specifics: SpecificTimingModel[] = [];

    AllDay: boolean = false;
}