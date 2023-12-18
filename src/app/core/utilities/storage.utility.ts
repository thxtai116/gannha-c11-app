import { Injectable } from "@angular/core";

@Injectable()
export class StorageUtility {

    set(key: string, value: any): void {
        localStorage.setItem(key, value);
    }

    get(key: string): string {
        return localStorage.getItem(key);
    }

    clear() {
        localStorage.clear();
    }
}