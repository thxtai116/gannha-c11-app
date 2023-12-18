import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'wordsCounter',
    pure: false
})
export class WordsCounterPipe implements PipeTransform {

    transform(value: string, args?: any): any {
        if (value && value.length > 0) {
            return value.split(' ').filter(item => item.length > 0).length;
        }
        
        return 0;
    }
}