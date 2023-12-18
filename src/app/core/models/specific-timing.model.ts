export class SpecificTimingModel {
    constructor(open: string = "08:00:00", close: string = "22:00:00", fullDay: boolean = false) {
        this.Open = open;
        this.Close = close;
        this.Is24H = fullDay;
    }

    Open: string = '';
    Close: string = '';
    Is24H: boolean = false;
}