export class SystemEventModel {
    message: string = "";

    value: string = "";

    constructor(message: string, value: string) {
        this.message = message;
        this.value = value;
    }
}