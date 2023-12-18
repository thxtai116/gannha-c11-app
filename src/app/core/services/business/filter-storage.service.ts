import { Injectable } from '@angular/core';

@Injectable()

export class FilterStorageService {
    private _value: { [key: string]: any } = {};

    constructor() {
    }

    get(key: string): any {
        return this._value[key];
    }

    set(key: string, value: any): void {
        this._value[key] = value;
    }
}