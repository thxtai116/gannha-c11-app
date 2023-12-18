export class NotificationRequestModel {
    Request: any = {
        Title: {
            "vi": ""
        },
        Content: {
            "vi": ""
        },
        ResourceId: ""
    };

    Schedule: any = {
        ExecutedTimes: [],
        StartDate: new Date()
    };
}