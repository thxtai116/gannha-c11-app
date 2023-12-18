import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'DateRangePipe'
})

export class DateRangePipe implements PipeTransform {
    transform(rangeDates: any, args?: any): any {
        if (rangeDates) {
            const range = rangeDates.map(d => moment(d).format('DD/MM/YYYY'));
            return range[0] + ' - ' + range[1];
        } else {
            return null;
        }
    }
}
