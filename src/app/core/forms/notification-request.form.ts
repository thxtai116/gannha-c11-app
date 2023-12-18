export class NotificationRequestForm {
    Title: string = "";

    Content: string = "";

    ResourceId: string = "";

    StartDate: Date = new Date();

    ExecutedTimes: any[] = [];

    SendNow: boolean = true;

    Segment: string = "";

    Devices: string[] = [];
}