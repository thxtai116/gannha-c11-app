import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'degreeName',
    pure: false
})
export class DegreeNamePipe implements PipeTransform {

    private _highSchool: any = {
        "en": "HighSchool",
        "vi": "THPT"
    }

    private _college: any = {
        "en": "College",
        "vi": "Cao đẳng"
    }

    private _university: any = {
        "en": "University",
        "vi": "Đại học"
    }

    private _not_set: any = {
        "en": "No set",
        "vi": "Chưa cập nhật"
    }

    transform(value: number, selectedLanguage: string = "vi"): any {
        if (value == 0) {
            return this._highSchool[selectedLanguage];
        } else if (value == 1) {
            return this._college[selectedLanguage];
        } else if (value == 2) {
            return this._university[selectedLanguage];
        } else {
            return this._not_set[selectedLanguage];
        }
    }
}