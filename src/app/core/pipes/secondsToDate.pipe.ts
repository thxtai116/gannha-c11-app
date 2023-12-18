import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'mSecondsToDate',
    pure: false
})
export class SecondsToDatePipe implements PipeTransform {

    transform(value: number, args?: any): any {
        return new Date(value * 1000);
    }
}