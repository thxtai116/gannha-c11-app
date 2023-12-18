import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'shortTime',
    pure: false
})
export class ShortTimePipe implements PipeTransform {

    transform(value: string, args?: any): any {
        if (!value) return null;
        return value.substring(0,5);
    }
}