import { Pipe, PipeTransform } from '@angular/core';
import { LocaleString } from "../types/index";

@Pipe({
    name: 'mLanguage',
    pure: false
})
export class LanguagePipe implements PipeTransform {
    transform(value: LocaleString, selectedLanguage: string = "vi"): any {
        return (value && value[selectedLanguage] && value[selectedLanguage].length > 0) ? value[selectedLanguage] : "";
    }
}