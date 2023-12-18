import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
    name: 'mMomentToDate',
    pure: false
})
export class MomentToDatePipe implements PipeTransform {
    transform(value: any): any {
        return moment.isMoment(value) ? value.toDate() : value;
    }
}