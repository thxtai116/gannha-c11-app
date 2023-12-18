import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'genderName',
    pure: false
})
export class GenderNamePipe implements PipeTransform {

    private _female: any = {
        "en": "Female",
        "vi": "Nữ"
    }

    private _male: any = {
        "en": "Male",
        "vi": "Nam"
    }

    private _other: any = {
        "en": "Other",
        "vi": "Không xác định"
    }

    private _not_set: any = {
        "en": "No set",
        "vi": "Chưa cập nhật"
    }

    transform(value: number, selectedLanguage: string = "vi"): any {
        if (value == 0) {
            return this._other[selectedLanguage];
        } else if (value == 1) {
            return this._female[selectedLanguage];
        } else if (value == 2) {
            return this._male[selectedLanguage];
        } else {
            return this._not_set[selectedLanguage];
        }
    }
}