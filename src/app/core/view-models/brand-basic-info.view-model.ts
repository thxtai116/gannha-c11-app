import { ResourceModel, TimingModel, PhoneModel } from '../models';

export class BrandBasicInfoViewModel {
    Name: string = "";

    Status: number = 0;

    Slogan: string = "";

    Categories: string[] = [];

    Utilities: string[] = [];

    Tags: string[] = [];

    Logo: ResourceModel[] = [];

    Video: string[] = [];

    Timing: TimingModel = new TimingModel();

    Phones: PhoneModel[] = [];

    Background: ResourceModel[] = [];

    Pics: ResourceModel[] = [];

    Properties: string[] = [];
}