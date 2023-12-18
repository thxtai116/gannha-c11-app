import { Pipe, PipeTransform } from '@angular/core';
import * as objectPath from "object-path";

@Pipe({
    name: 'mPropertyInList',
    pure: false
})
export class PropertyInListPipe implements PipeTransform {
    transform(value: string, lookUpValue: string = "", lst: any[] = [], property: string = "", defaultValue = ""): any {
        if (!value)
            return defaultValue;

        let model = lst.find(x => x[lookUpValue] === value);

        if (model) {
            return objectPath.get(model, property) || defaultValue;
        } else
            return defaultValue;
    }
}