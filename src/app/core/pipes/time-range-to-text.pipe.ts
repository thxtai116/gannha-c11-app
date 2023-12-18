import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeRangeToText',
    pure: false
})
export class TimeRangeToTextPipe implements PipeTransform {

    transform(value: any, args?: any): any {
        if (!value || value.length !== 2) return null;

        let text = (value[0] === 0 && value[1] === 24) ?
            "Cả ngày" :
            `${this.convertTotalHoursToTimeString(value[0].toString())} - ${this.convertTotalHoursToTimeString(value[1].toString())}`;

        return text;
    }

    convertTotalHoursToTimeString(time: string) {
        return Math.floor(+time) + ":" + Math.floor((+time - Math.floor(+time)) * 60);
    }
}