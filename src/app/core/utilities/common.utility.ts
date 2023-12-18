import { Injectable } from '@angular/core';

@Injectable()
export class CommonUtility {

    parseValue<T>(value: T): T {
        return JSON.parse(JSON.stringify(value)) as T;
    }

    countWords(sentence: string): number {
        if (sentence && sentence.length > 0) {
            return sentence.split(' ').filter(item => item.length > 0).length;
        }
        return 0;
    }

    parseEnumToList(target: any): any[] {
        let keyPairValues: any[] = [];
        let objValues = Object.keys(target).map(k => target[k]);
        let keys = objValues.filter(v => typeof v === "number") as number[];
        let values = objValues.filter(v => typeof v === "string") as string[];

        for (let key in keys) {
            keyPairValues.push({
                key: keys[key],
                value: values[key]
            });
        }

        return keyPairValues;
    }
}